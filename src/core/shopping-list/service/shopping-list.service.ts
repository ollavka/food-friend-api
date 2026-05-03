import { Injectable } from '@nestjs/common'
import {
  LanguageCode,
  Prisma,
  RecipeStatus,
  ShoppingListItemStatus,
  ShoppingListStatus,
  User,
  UserRole,
} from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppEntityNotFoundException } from '@common/exception'
import { PaginatedResult, Uuid } from '@common/type'
import { buildCompositeKey, hashToUuid, pickTranslationByLanguage } from '@common/util'
import { LanguageService } from '@core/language'
import { PrismaService } from '@infrastructure/database'
import { PaginationService } from '@infrastructure/pagination'
import { PaginatedShoppingListsApiModel, ShoppingListApiModel, ShoppingListListItemApiModel } from '../api-model'
import { GenerateShoppingListDto, ShoppingListQueryDto, UpdateShoppingListItemDto } from '../dto'
import { ShoppingListRepository } from '../repository'
import { ShoppingListDetails, ShoppingListListItem } from '../type'

@Injectable()
export class ShoppingListService {
  public constructor(
    private readonly shoppingListRepository: ShoppingListRepository,
    private readonly languageService: LanguageService,
    private readonly paginationService: PaginationService,
    private readonly prismaService: PrismaService,
  ) {}

  public async generateShoppingList(
    user: User,
    dto: GenerateShoppingListDto,
    languageCode: LanguageCode,
  ): Promise<ShoppingListApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()

    const recipeIds = [...new Set(dto.recipeIds.map((id) => <Uuid>hashToUuid(id)))]

    const recipes = await this.shoppingListRepository.findRecipesForGeneration(recipeIds, [
      language.id,
      defaultLanguage.id,
    ])

    const foundRecipeIdSet = new Set(recipes.map((recipe) => recipe.id))
    const missingRecipeId = recipeIds.find((id) => !foundRecipeIdSet.has(id))

    if (missingRecipeId) {
      throw AppEntityNotFoundException.byId('Recipe', missingRecipeId)
    }

    for (const recipe of recipes) {
      const canUseRecipe = this.canUseRecipeForShoppingList(recipe.status, recipe.authorId, user)

      if (!canUseRecipe) {
        throw AppEntityNotFoundException.byId('Recipe', recipe.id)
      }
    }

    const aggregatedItems = this.aggregateRecipeIngredients(recipes)

    const createdShoppingListId = await this.prismaService.$transaction(async (tx) => {
      const shoppingList = await this.shoppingListRepository.createShoppingList(
        {
          title: dto.title,
          status: ShoppingListStatus.ACTIVE,
          user: {
            connect: {
              id: user.id,
            },
          },
          sourceLanguage: {
            connect: {
              id: language.id,
            },
          },
          recipes: {
            create: recipes.map((recipe) => ({
              recipe: {
                connect: {
                  id: recipe.id,
                },
              },
            })),
          },
          items: {
            create: aggregatedItems.map((item) => ({
              quantity: item.quantity,
              note: null,
              isManual: false,
              status: ShoppingListItemStatus.PENDING,
              product: {
                connect: {
                  id: item.productId,
                },
              },
              measurementUnit: {
                connect: {
                  id: item.measurementUnitId,
                },
              },
            })),
          },
        },
        tx,
      )

      return shoppingList.id
    })

    return this.getShoppingListById(createdShoppingListId, user, languageCode)
  }

  public async getPaginatedShoppingLists(
    query: ShoppingListQueryDto,
    user: User,
  ): Promise<PaginatedShoppingListsApiModel> {
    const paginatedShoppingLists = await this.findPaginatedShoppingLists(query, user.id)

    return {
      items: ShoppingListListItemApiModel.fromList(paginatedShoppingLists.items),
      meta: paginatedShoppingLists.meta,
    }
  }

  public async getShoppingListById(id: Uuid, user: User, languageCode: LanguageCode): Promise<ShoppingListApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()

    const shoppingList = await this.shoppingListRepository.findShoppingListById(id, [language.id, defaultLanguage.id])

    if (!shoppingList) {
      throw AppEntityNotFoundException.byId('ShoppingList', id)
    }

    this.enforceShoppingListAccess(shoppingList.userId, user)

    const mappedShoppingList = this.mapShoppingListDetails(shoppingList, language.id, defaultLanguage.id)

    return ShoppingListApiModel.from(mappedShoppingList)
  }

  public async updateShoppingListItem(
    shoppingListId: Uuid,
    itemId: Uuid,
    user: User,
    dto: UpdateShoppingListItemDto,
    languageCode: LanguageCode,
  ): Promise<ShoppingListApiModel> {
    await this.prismaService.$transaction(async (tx) => {
      const shoppingListForAccess = await this.shoppingListRepository.findShoppingListForAccess(shoppingListId, tx)

      if (!shoppingListForAccess) {
        throw AppEntityNotFoundException.byId('ShoppingList', shoppingListId)
      }

      this.enforceShoppingListAccess(shoppingListForAccess.userId, user)

      const itemForAccess = await this.shoppingListRepository.findShoppingListItemForAccess(shoppingListId, itemId, tx)

      if (!itemForAccess) {
        throw AppEntityNotFoundException.byId('ShoppingListItem', itemId)
      }

      const hasManualChange = dto.quantity !== undefined || dto.note !== undefined

      const updateData: Prisma.ShoppingListItemUpdateInput = {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
        ...(hasManualChange ? { isManual: true } : {}),
      }

      if (Object.keys(updateData).length === 0) {
        return
      }

      await this.shoppingListRepository.updateShoppingListItem(itemId, updateData, tx)
    })

    return this.getShoppingListById(shoppingListId, user, languageCode)
  }

  private async findPaginatedShoppingLists(
    query: ShoppingListQueryDto,
    userId: Uuid,
  ): Promise<PaginatedResult<ShoppingListListItem>> {
    const { filter, pagination } = query

    const where = this.shoppingListRepository.prepareShoppingListWhereInput(userId, filter ?? {})
    const sort = this.shoppingListRepository.prepareShoppingListSortInput(query.sort)

    const paginatedShoppingLists = await this.paginationService.paginate({
      ...(pagination ?? {}),
      countFn: () => this.shoppingListRepository.getTotalShoppingListsCount(where),
      itemsFn: (skip, take) => this.shoppingListRepository.getPaginatedShoppingListItems(where, sort, skip, take),
    })

    return {
      ...paginatedShoppingLists,
      items: paginatedShoppingLists.items.map((shoppingList) => this.mapShoppingListListItem(shoppingList)),
    }
  }

  private mapShoppingListListItem(
    shoppingList: Awaited<ReturnType<ShoppingListRepository['getPaginatedShoppingListItems']>>[number],
  ): ShoppingListListItem {
    return {
      id: shoppingList.id,
      title: shoppingList.title,
      status: shoppingList.status,
      itemsCount: shoppingList._count.items,
      createdAt: shoppingList.createdAt,
      updatedAt: shoppingList.updatedAt,
    }
  }

  private mapShoppingListDetails(
    shoppingList: NonNullable<Awaited<ReturnType<ShoppingListRepository['findShoppingListById']>>>,
    languageId: Uuid,
    defaultLanguageId: Uuid,
  ): ShoppingListDetails {
    const recipes = shoppingList.recipes.map(({ recipe }) => {
      const translation = pickTranslationByLanguage(recipe.translations, languageId, defaultLanguageId)

      return {
        id: recipe.id,
        slug: recipe.slug,
        title: translation?.title ?? recipe.slug,
        status: recipe.status,
      }
    })

    const items = shoppingList.items.map((item) => {
      const productTranslation = pickTranslationByLanguage(item.product.translations, languageId, defaultLanguageId)
      const measurementUnitTranslation = pickTranslationByLanguage(
        item.measurementUnit.translations,
        languageId,
        defaultLanguageId,
      )

      return {
        id: item.id,
        productId: item.productId,
        productName: productTranslation?.name ?? item.product.slug,
        measurementUnitKey: item.measurementUnit.key,
        measurementUnitLabel: measurementUnitTranslation?.label ?? item.measurementUnit.key,
        quantity: Number(item.quantity),
        note: item.note,
        isManual: item.isManual,
        status: item.status,
      }
    })

    return {
      id: shoppingList.id,
      title: shoppingList.title,
      status: shoppingList.status,
      itemsCount: shoppingList.items.length,
      createdAt: shoppingList.createdAt,
      updatedAt: shoppingList.updatedAt,
      recipes,
      items,
    }
  }

  private aggregateRecipeIngredients(
    recipes: Awaited<ReturnType<ShoppingListRepository['findRecipesForGeneration']>>,
  ): Array<{ productId: Uuid; measurementUnitId: Uuid; quantity: number }> {
    const aggregatedItems = new Map<string, { productId: Uuid; measurementUnitId: Uuid; quantity: number }>()

    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        const aggregateKey = buildCompositeKey(ingredient.productId, ingredient.measurementUnitId)
        const quantity = Number(ingredient.quantity)
        const current = aggregatedItems.get(aggregateKey)

        if (current) {
          current.quantity += quantity
          continue
        }

        aggregatedItems.set(aggregateKey, {
          productId: ingredient.productId,
          measurementUnitId: ingredient.measurementUnitId,
          quantity,
        })
      }
    }

    return [...aggregatedItems.values()]
  }

  private canUseRecipeForShoppingList(status: RecipeStatus, authorId: Uuid, user: User): boolean {
    if (status === RecipeStatus.PUBLISHED) {
      return true
    }

    if (user.role === UserRole.ADMIN) {
      return true
    }

    return authorId === user.id
  }

  private enforceShoppingListAccess(ownerId: Uuid, user: User): void {
    if (user.role === UserRole.ADMIN || ownerId === user.id) {
      return
    }

    throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
  }
}
