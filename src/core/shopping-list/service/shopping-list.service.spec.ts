import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode, RecipeStatus, ShoppingListStatus, UserRole } from '@prisma/client'
import { AppEntityNotFoundException } from '@common/exception'
import { uuidToHash } from '@common/util/hash.util'
import { ShoppingListService } from './shopping-list.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const OTHER_USER_ID = '22222222-2222-4222-8222-222222222222'
const LANGUAGE_EN_ID = '33333333-3333-4333-8333-333333333333'
const LANGUAGE_UK_ID = '44444444-4444-4444-8444-444444444444'

const RECIPE_1_ID = '55555555-5555-4555-8555-555555555555'
const RECIPE_2_ID = '66666666-6666-4666-8666-666666666666'
const RECIPE_3_ID = '77777777-7777-4777-8777-777777777777'
const PRODUCT_1_ID = '88888888-8888-4888-8888-888888888888'
const PRODUCT_2_ID = '99999999-9999-4999-8999-999999999999'
const UNIT_GR_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const UNIT_ML_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const LIST_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const ITEM_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'

describe('ShoppingListService', () => {
  const shoppingListRepository: any = {
    findRecipesForGeneration: jest.fn(),
    createShoppingList: jest.fn(),
    findShoppingListById: jest.fn(),
    findShoppingListForAccess: jest.fn(),
    findShoppingListItemForAccess: jest.fn(),
    updateShoppingListItem: jest.fn(),
    prepareShoppingListWhereInput: jest.fn(),
    prepareShoppingListSortInput: jest.fn(),
    getTotalShoppingListsCount: jest.fn(),
    getPaginatedShoppingListItems: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
    getDefaultLanguage: jest.fn(),
  }

  const paginationService: any = {
    paginate: jest.fn(),
  }

  const prismaService: any = {
    $transaction: jest.fn(),
  }

  let shoppingListService: ShoppingListService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
    })
    languageService.getDefaultLanguage.mockResolvedValue({
      id: LANGUAGE_UK_ID,
      code: LanguageCode.UK,
    })

    prismaService.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({ tx: true }),
    )

    shoppingListService = new ShoppingListService(
      shoppingListRepository as never,
      languageService as never,
      paginationService as never,
      prismaService as never,
    )
  })

  it('should aggregate ingredients by productId+measurementUnitId and deduplicate recipeIds', async () => {
    const dto = {
      recipeIds: [uuidToHash(RECIPE_1_ID as never), uuidToHash(RECIPE_1_ID as never), uuidToHash(RECIPE_2_ID as never)],
      title: 'Weekly list',
    }

    shoppingListRepository.findRecipesForGeneration.mockResolvedValue([
      {
        id: RECIPE_1_ID,
        status: RecipeStatus.PUBLISHED,
        authorId: OTHER_USER_ID,
        ingredients: [
          { productId: PRODUCT_1_ID, measurementUnitId: UNIT_GR_ID, quantity: 100 },
          { productId: PRODUCT_2_ID, measurementUnitId: UNIT_GR_ID, quantity: 50 },
        ],
      },
      {
        id: RECIPE_2_ID,
        status: RecipeStatus.DRAFT,
        authorId: USER_ID,
        ingredients: [
          { productId: PRODUCT_1_ID, measurementUnitId: UNIT_GR_ID, quantity: 25 },
          { productId: PRODUCT_1_ID, measurementUnitId: UNIT_ML_ID, quantity: 200 },
        ],
      },
    ])
    shoppingListRepository.createShoppingList.mockResolvedValue({ id: LIST_ID })

    jest.spyOn(shoppingListService, 'getShoppingListById').mockResolvedValue({ id: LIST_ID } as never)

    await shoppingListService.generateShoppingList(
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      dto as never,
      LanguageCode.EN,
    )

    expect(shoppingListRepository.findRecipesForGeneration).toHaveBeenCalledWith(
      [RECIPE_1_ID, RECIPE_2_ID],
      [LANGUAGE_EN_ID, LANGUAGE_UK_ID],
    )

    const createInput = shoppingListRepository.createShoppingList.mock.calls[0][0]
    const createdItems = createInput.items.create

    expect(createdItems).toHaveLength(3)
    expect(createdItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          quantity: 125,
          product: { connect: { id: PRODUCT_1_ID } },
          measurementUnit: { connect: { id: UNIT_GR_ID } },
        }),
        expect.objectContaining({
          quantity: 50,
          product: { connect: { id: PRODUCT_2_ID } },
          measurementUnit: { connect: { id: UNIT_GR_ID } },
        }),
        expect.objectContaining({
          quantity: 200,
          product: { connect: { id: PRODUCT_1_ID } },
          measurementUnit: { connect: { id: UNIT_ML_ID } },
        }),
      ]),
    )
  })

  it('should reject foreign non-published recipe during shopping list generation', async () => {
    shoppingListRepository.findRecipesForGeneration.mockResolvedValue([
      {
        id: RECIPE_3_ID,
        status: RecipeStatus.DRAFT,
        authorId: OTHER_USER_ID,
        ingredients: [],
      },
    ])

    await expect(
      shoppingListService.generateShoppingList(
        {
          id: USER_ID,
          role: UserRole.REGULAR,
        } as never,
        {
          recipeIds: [uuidToHash(RECIPE_3_ID as never)],
        } as never,
        LanguageCode.EN,
      ),
    ).rejects.toThrow(AppEntityNotFoundException)
  })

  it('should mark item as manual when quantity or note is updated manually', async () => {
    shoppingListRepository.findShoppingListForAccess.mockResolvedValue({
      id: LIST_ID,
      userId: USER_ID,
    })
    shoppingListRepository.findShoppingListItemForAccess.mockResolvedValue({
      id: ITEM_ID,
      shoppingListId: LIST_ID,
    })
    shoppingListRepository.updateShoppingListItem.mockResolvedValue({
      id: ITEM_ID,
    })
    jest.spyOn(shoppingListService, 'getShoppingListById').mockResolvedValue({ id: LIST_ID } as never)

    await shoppingListService.updateShoppingListItem(
      LIST_ID as never,
      ITEM_ID as never,
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      {
        quantity: 123.5,
        note: 'Need organic',
      } as never,
      LanguageCode.EN,
    )

    expect(shoppingListRepository.updateShoppingListItem).toHaveBeenCalledWith(
      ITEM_ID,
      expect.objectContaining({
        quantity: 123.5,
        note: 'Need organic',
        isManual: true,
      }),
      expect.anything(),
    )
  })

  it('should return localized names with current -> default fallback', async () => {
    shoppingListRepository.findShoppingListById.mockResolvedValue({
      id: LIST_ID,
      userId: USER_ID,
      title: 'List',
      status: ShoppingListStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      recipes: [
        {
          recipe: {
            id: RECIPE_1_ID,
            slug: 'potato-soup',
            status: RecipeStatus.PUBLISHED,
            translations: [
              {
                languageId: LANGUAGE_UK_ID,
                title: 'Картопляний суп',
              },
            ],
          },
        },
      ],
      items: [
        {
          id: ITEM_ID,
          productId: PRODUCT_1_ID,
          note: null,
          isManual: false,
          status: 'PENDING',
          quantity: 2,
          product: {
            slug: 'potato',
            translations: [
              {
                languageId: LANGUAGE_UK_ID,
                name: 'Картопля',
              },
            ],
          },
          measurementUnit: {
            key: 'GRAM',
            translations: [
              {
                languageId: LANGUAGE_UK_ID,
                label: 'Грам',
              },
            ],
          },
        },
      ],
    })

    const result = await shoppingListService.getShoppingListById(
      LIST_ID as never,
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      LanguageCode.EN,
    )

    expect(result.recipes[0].title).toBe('Картопляний суп')
    expect(result.items[0].productName).toBe('Картопля')
    expect(result.items[0].measurementUnitLabel).toBe('Грам')
  })
})
