import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ShoppingListStatus } from '@prisma/client'
import { SortOrder } from '@common/enum'
import { ShoppingListRepository } from './shopping-list.repository'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const LIST_ID = '22222222-2222-4222-8222-222222222222'
const ITEM_ID = '33333333-3333-4333-8333-333333333333'
const LANGUAGE_ID = '44444444-4444-4444-8444-444444444444'

describe('ShoppingListRepository', () => {
  const prismaService: any = {
    recipe: {
      findMany: jest.fn(),
    },
    shoppingList: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    shoppingListItem: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  }

  let repository: ShoppingListRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new ShoppingListRepository(prismaService)
  })

  it('should query recipes for shopping list generation', async () => {
    await repository.findRecipesForGeneration([LIST_ID] as never, [LANGUAGE_ID] as never)

    expect(prismaService.recipe.findMany).toHaveBeenCalled()
  })

  it('should prepare where and sort inputs', () => {
    const whereDefault = repository.prepareShoppingListWhereInput(USER_ID as never, {} as never)
    const whereArchived = repository.prepareShoppingListWhereInput(
      USER_ID as never,
      { status: ShoppingListStatus.ARCHIVED } as never,
    )

    expect(whereDefault).toEqual({
      userId: USER_ID,
      status: ShoppingListStatus.ACTIVE,
    })
    expect(whereArchived).toEqual({
      userId: USER_ID,
      status: ShoppingListStatus.ARCHIVED,
    })

    expect(repository.prepareShoppingListSortInput()).toEqual({ createdAt: SortOrder.Descending })
    expect(
      repository.prepareShoppingListSortInput({
        field: 'updatedAt',
        order: SortOrder.Ascending,
      } as never),
    ).toEqual({
      updatedAt: SortOrder.Ascending,
    })
  })

  it('should count and paginate shopping lists', async () => {
    prismaService.shoppingList.count.mockResolvedValue(2)
    prismaService.shoppingList.findMany.mockResolvedValue([])

    const total = await repository.getTotalShoppingListsCount({ userId: USER_ID })
    await repository.getPaginatedShoppingListItems({ userId: USER_ID }, { createdAt: 'desc' }, 0, 10)

    expect(total).toBe(2)
    expect(prismaService.shoppingList.findMany).toHaveBeenCalled()
  })

  it('should find shopping list with localized relations', async () => {
    prismaService.shoppingList.findUnique.mockResolvedValue({ id: LIST_ID })

    const list = await repository.findShoppingListById(LIST_ID as never, [LANGUAGE_ID] as never)

    expect(list).toEqual({ id: LIST_ID })
    expect(prismaService.shoppingList.findUnique).toHaveBeenCalled()
  })

  it('should query shopping list/list item access projections', async () => {
    await repository.findShoppingListForAccess(LIST_ID as never)
    await repository.findShoppingListItemForAccess(LIST_ID as never, ITEM_ID as never)

    expect(prismaService.shoppingList.findUnique).toHaveBeenCalledWith({
      where: { id: LIST_ID },
      select: {
        id: true,
        userId: true,
      },
    })
    expect(prismaService.shoppingListItem.findFirst).toHaveBeenCalledWith({
      where: {
        id: ITEM_ID,
        shoppingListId: LIST_ID,
      },
      select: {
        id: true,
        shoppingListId: true,
      },
    })
  })

  it('should create shopping list and update shopping list item', async () => {
    await repository.createShoppingList({ title: 'Weekly list' } as never)
    await repository.updateShoppingListItem(ITEM_ID as never, { note: 'Updated note' } as never)

    expect(prismaService.shoppingList.create).toHaveBeenCalledWith({
      data: { title: 'Weekly list' },
    })
    expect(prismaService.shoppingListItem.update).toHaveBeenCalledWith({
      where: { id: ITEM_ID },
      data: { note: 'Updated note' },
    })
  })
})
