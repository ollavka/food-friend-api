import { Inject, Injectable } from '@nestjs/common'
import { BackgroundJobType, LanguageCode, Prisma, RecipeStatus, User, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppBadRequestException, AppEntityNotFoundException } from '@common/exception'
import { PaginatedResult, Uuid } from '@common/type'
import {
  buildCompositeKey,
  getLanguageLabelByCode,
  hashToUuid,
  isUuid,
  pickTranslationByLanguage,
  randomHash,
  slugifyText,
  toLowerCase,
} from '@common/util'
import { LanguageService } from '@core/language'
import { RecipeDifficultyService } from '@core/recipe-difficulty'
import { SearchService } from '@core/search'
import { UserService } from '@core/user'
import { AI_PROVIDER_TOKEN, AiProvider, GenerateStructuredJsonInput } from '@infrastructure/ai'
import { PrismaService } from '@infrastructure/database'
import { PaginationService } from '@infrastructure/pagination'
import {
  PaginatedRecipesApiModel,
  PantryMatchRecipesApiModel,
  RecipeApiModel,
  RecipeListItemApiModel,
  RecipeRecommendationsApiModel,
  RecipeSubstitutionsApiModel,
} from '../api-model'
import {
  CreateRecipeDto,
  PantryMatchDto,
  RecipeIngredientInputDto,
  RecipeNutritionInputDto,
  RecipeQueryDto,
  RecipeRecommendationsQueryDto,
  RecipeStepInputDto,
  RecipeSubstitutionsDto,
  UpdateRecipeDto,
} from '../dto'
import { RecipeRepository } from '../repository'
import {
  PantryMatchItem,
  PantryMissingIngredient,
  RecipeDetails,
  RecipeListItem,
  RecipeRecommendationItem,
  RecipeRecommendationMatchMeta,
  RecipeSubstitutionItem,
} from '../type'
import {
  calculateDailyCaloriesTarget,
  calculateDailyProteinsTarget,
  calculateRecommendationScore,
  normalizeExplanationItems,
  normalizePantryItems,
} from '../util'

@Injectable()
export class RecipeService {
  public constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeDifficultyService: RecipeDifficultyService,
    private readonly languageService: LanguageService,
    private readonly searchService: SearchService,
    private readonly userService: UserService,
    private readonly paginationService: PaginationService,
    private readonly prismaService: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AiProvider,
  ) {}

  public async getRecipeById(
    id: Uuid,
    languageCode: LanguageCode,
    user?: User,
    options?: { incrementViews?: boolean },
  ): Promise<RecipeApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()

    const recipe = await this.recipeRepository.findRecipeById(id, [language.id, defaultLanguage.id], user?.id)

    if (!recipe) {
      throw AppEntityNotFoundException.byId('Recipe', id)
    }

    const isPublished = recipe.status === RecipeStatus.PUBLISHED
    const canAccessUnpublished = this.canManageRecipe(recipe.authorId, user)

    if (!isPublished && !canAccessUnpublished) {
      throw AppEntityNotFoundException.byId('Recipe', id)
    }

    if (options?.incrementViews && isPublished) {
      await this.recipeRepository.incrementRecipeViews(id)
      recipe.viewsCount += 1
    }

    const mappedRecipe = this.mapRecipeDetails(recipe, language.id, defaultLanguage.id, user?.id)
    return RecipeApiModel.from(mappedRecipe)
  }

  public async getPaginatedRecipes(
    query: RecipeQueryDto,
    languageCode: LanguageCode,
  ): Promise<PaginatedRecipesApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()

    const paginatedRecipes = await this.findPaginatedRecipes(query, [language.id, defaultLanguage.id])

    return {
      items: RecipeListItemApiModel.fromList(paginatedRecipes.items),
      meta: paginatedRecipes.meta,
    }
  }

  public async getPaginatedFavoriteRecipes(
    query: RecipeQueryDto,
    languageCode: LanguageCode,
    user: User,
  ): Promise<PaginatedRecipesApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()

    const paginatedRecipes = await this.findPaginatedRecipes(query, [language.id, defaultLanguage.id], {
      viewerUserId: user.id,
      favoritesByUserId: user.id,
    })

    return {
      items: RecipeListItemApiModel.fromList(paginatedRecipes.items),
      meta: paginatedRecipes.meta,
    }
  }

  public async createRecipe(user: User, dto: CreateRecipeDto, languageCode: LanguageCode): Promise<RecipeApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const difficulty = await this.recipeDifficultyService.getRecipeDifficultyByKey(dto.difficulty)

    if (!difficulty) {
      throw AppEntityNotFoundException.by('RecipeDifficulty', { key: dto.difficulty })
    }

    const ingredientPayload = this.prepareIngredientPayload(dto.ingredients)

    const createdRecipeId = await this.prismaService.$transaction(async (tx) => {
      await this.validateIngredientRelations(ingredientPayload, tx)

      const slug = await this.generateUniqueSlug(dto.title, tx)

      const recipe = await this.recipeRepository.createRecipe(
        {
          slug,
          status: dto.status ?? RecipeStatus.DRAFT,
          cookingTimeMinutes: dto.cookingTimeMinutes,
          servings: dto.servings,
          imageUrl: dto.imageUrl,
          imageKey: dto.imageKey,
          publishedAt: (dto.status ?? RecipeStatus.DRAFT) === RecipeStatus.PUBLISHED ? new Date() : null,
          sourceLanguage: {
            connect: {
              id: language.id,
            },
          },
          author: {
            connect: {
              id: user.id,
            },
          },
          difficulty: {
            connect: {
              id: difficulty.id,
            },
          },
          translations: {
            create: {
              language: {
                connect: {
                  id: language.id,
                },
              },
              title: dto.title,
              description: dto.description,
              isAutoTranslated: false,
            },
          },
          steps: {
            create: this.prepareRecipeStepCreateData(dto.steps, language.id),
          },
          ingredients: {
            create: ingredientPayload.map((ingredient) => ({
              sortOrder: ingredient.sortOrder,
              quantity: ingredient.quantity,
              note: ingredient.note,
              product: {
                connect: {
                  id: ingredient.productId,
                },
              },
              measurementUnit: {
                connect: {
                  id: ingredient.measurementUnitId,
                },
              },
            })),
          },
          ...(dto.nutrition
            ? {
                nutrition: {
                  create: this.prepareNutritionCreateData(dto.nutrition),
                },
              }
            : {}),
        },
        tx,
      )

      await this.createRecipeTranslationJobs(recipe.id, language.id, user.id, tx)
      await this.searchService.enqueueRecipeSyncJob(recipe.id, user.id, 'UPSERT', tx)

      return recipe.id
    })

    return this.getRecipeById(createdRecipeId, languageCode, user)
  }

  public async updateRecipe(
    id: Uuid,
    user: User,
    dto: UpdateRecipeDto,
    languageCode: LanguageCode,
  ): Promise<RecipeApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const shouldCreateTranslationJobs =
      dto.title !== undefined || dto.description !== undefined || dto.steps !== undefined

    await this.prismaService.$transaction(async (tx) => {
      const recipeForAccess = await this.recipeRepository.findRecipeForAccess(id, tx)

      if (!recipeForAccess) {
        throw AppEntityNotFoundException.byId('Recipe', id)
      }

      this.enforceRecipeOwnerAccess(recipeForAccess.authorId, user)

      const updateData: Prisma.RecipeUpdateInput = {
        ...(dto.cookingTimeMinutes !== undefined ? { cookingTimeMinutes: dto.cookingTimeMinutes } : {}),
        ...(dto.servings !== undefined ? { servings: dto.servings } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.imageKey !== undefined ? { imageKey: dto.imageKey } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      }

      if (dto.status !== undefined) {
        if (dto.status === RecipeStatus.PUBLISHED) {
          updateData.publishedAt = recipeForAccess.publishedAt ? undefined : new Date()
        } else {
          updateData.publishedAt = null
        }
      }

      if (dto.difficulty) {
        const difficulty = await this.recipeDifficultyService.getRecipeDifficultyByKey(dto.difficulty)

        if (!difficulty) {
          throw AppEntityNotFoundException.by('RecipeDifficulty', { key: dto.difficulty })
        }

        updateData.difficulty = {
          connect: {
            id: difficulty.id,
          },
        }
      }

      if (dto.title !== undefined || dto.description !== undefined) {
        const currentTranslation = await this.recipeRepository.findRecipeTranslationByLanguage(id, language.id, tx)

        if (!currentTranslation && dto.title === undefined) {
          throw new AppBadRequestException(
            'recipe.translation-title-required',
            'Recipe title is required to create translation for the selected language.',
          )
        }

        updateData.translations = {
          upsert: {
            where: {
              recipeId_languageId: {
                recipeId: id,
                languageId: language.id,
              },
            },
            create: {
              language: {
                connect: {
                  id: language.id,
                },
              },
              title: dto.title ?? currentTranslation!.title,
              description: dto.description,
              isAutoTranslated: false,
            },
            update: {
              ...(dto.title !== undefined ? { title: dto.title } : {}),
              ...(dto.description !== undefined ? { description: dto.description } : {}),
              isAutoTranslated: false,
            },
          },
        }
      }

      if (dto.steps !== undefined) {
        updateData.steps = {
          deleteMany: {},
          create: this.prepareRecipeStepCreateData(dto.steps, language.id),
        }
      }

      if (dto.ingredients !== undefined) {
        const ingredientPayload = this.prepareIngredientPayload(dto.ingredients)
        await this.validateIngredientRelations(ingredientPayload, tx)

        updateData.ingredients = {
          deleteMany: {},
          create: ingredientPayload.map((ingredient) => ({
            sortOrder: ingredient.sortOrder,
            quantity: ingredient.quantity,
            note: ingredient.note,
            product: {
              connect: {
                id: ingredient.productId,
              },
            },
            measurementUnit: {
              connect: {
                id: ingredient.measurementUnitId,
              },
            },
          })),
        }
      }

      if (dto.nutrition !== undefined) {
        updateData.nutrition = {
          upsert: {
            create: this.prepareNutritionCreateData(dto.nutrition),
            update: this.prepareNutritionUpdateData(dto.nutrition),
          },
        }
      }

      await this.recipeRepository.updateRecipe(id, updateData, tx)

      if (shouldCreateTranslationJobs) {
        await this.createRecipeTranslationJobs(id, language.id, user.id, tx)
      }

      await this.searchService.enqueueRecipeSyncJob(id, user.id, 'UPSERT', tx)
    })

    return this.getRecipeById(id, languageCode, user)
  }

  public async archiveRecipe(id: Uuid, user: User): Promise<null> {
    const recipe = await this.recipeRepository.findRecipeForAccess(id)

    if (!recipe) {
      throw AppEntityNotFoundException.byId('Recipe', id)
    }

    this.enforceRecipeOwnerAccess(recipe.authorId, user)

    await this.prismaService.$transaction(async (tx) => {
      await this.recipeRepository.updateRecipe(
        id,
        {
          status: RecipeStatus.ARCHIVED,
          publishedAt: null,
        },
        tx,
      )
      await this.searchService.enqueueRecipeSyncJob(id, user.id, 'UPSERT', tx)
    })

    return null
  }

  public async addRecipeLike(id: Uuid, user: User): Promise<null> {
    await this.prismaService.$transaction(async (tx) => {
      await this.ensureRecipeIsAvailableForInteractions(id, user, tx)

      const isCreated = await this.recipeRepository.createRecipeLikeIfNotExists(id, user.id, tx)

      if (!isCreated) {
        return
      }

      await this.recipeRepository.incrementRecipeLikes(id, tx)
    })

    return null
  }

  public async removeRecipeLike(id: Uuid, user: User): Promise<null> {
    await this.prismaService.$transaction(async (tx) => {
      await this.ensureRecipeIsAvailableForInteractions(id, user, tx)

      const isDeleted = await this.recipeRepository.removeRecipeLike(id, user.id, tx)

      if (!isDeleted) {
        return
      }

      await this.recipeRepository.decrementRecipeLikes(id, tx)
    })

    return null
  }

  public async addRecipeFavorite(id: Uuid, user: User): Promise<null> {
    await this.prismaService.$transaction(async (tx) => {
      await this.ensureRecipeIsAvailableForInteractions(id, user, tx)

      const isCreated = await this.recipeRepository.createRecipeFavoriteIfNotExists(id, user.id, tx)

      if (!isCreated) {
        return
      }

      await this.recipeRepository.incrementRecipeFavorites(id, tx)
    })

    return null
  }

  public async removeRecipeFavorite(id: Uuid, user: User): Promise<null> {
    await this.prismaService.$transaction(async (tx) => {
      await this.ensureRecipeIsAvailableForInteractions(id, user, tx)

      const isDeleted = await this.recipeRepository.removeRecipeFavorite(id, user.id, tx)

      if (!isDeleted) {
        return
      }

      await this.recipeRepository.decrementRecipeFavorites(id, tx)
    })

    return null
  }

  public async getRecipeRecommendations(
    user: User,
    languageCode: LanguageCode,
    query: RecipeRecommendationsQueryDto,
  ): Promise<RecipeRecommendationsApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()
    const profile = await this.userService.getNutritionProfileByUserId(user.id)

    if (!profile) {
      throw new AppBadRequestException(
        'recipe.recommendation-profile-required',
        'Nutrition profile is required for personalized recommendations.',
      )
    }

    const limit = query.limit ?? 10
    const targetCalories = profile.targetCalories ?? calculateDailyCaloriesTarget(profile)
    const targetProteins = calculateDailyProteinsTarget(profile)

    const recipes = await this.recipeRepository.findRecipesForRecommendations(
      user.id,
      [language.id, defaultLanguage.id],
      {
        limit: Math.max(limit * 3, limit),
        ...(query.maxCookingTimeMinutes !== undefined ? { maxCookingTimeMinutes: query.maxCookingTimeMinutes } : {}),
        ...(query.difficulty !== undefined ? { difficulty: query.difficulty } : {}),
      },
    )

    const recommendations = recipes
      .reduce<RecipeRecommendationItem[]>((acc, recipe) => {
        if (!recipe.nutrition?.kcal) {
          return acc
        }

        const recipeListItem = this.mapRecipeListItem(recipe, language.id, defaultLanguage.id, user.id)
        const servings = recipe.servings && recipe.servings > 0 ? recipe.servings : 1
        const caloriesPerServing = Number(recipe.nutrition.kcal) / servings
        const proteinsPerServing =
          recipe.nutrition.proteins !== null ? Number(recipe.nutrition.proteins) / servings : null
        const matchMeta: RecipeRecommendationMatchMeta = {
          targetCaloriesPerServing: targetCalories / 3,
          targetProteinsPerServing: targetProteins / 3,
          caloriesPerServing,
          proteinsPerServing,
          caloriesDelta: Math.abs(caloriesPerServing - targetCalories / 3),
          proteinsDelta: proteinsPerServing !== null ? Math.abs(proteinsPerServing - targetProteins / 3) : null,
        }

        acc.push({
          recipe: recipeListItem,
          score: calculateRecommendationScore(matchMeta),
          matchMeta,
          reason: null,
        })

        return acc
      }, [])
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    const reasonMap = await this.tryExplainRecipeRecommendations(
      language.code,
      targetCalories,
      targetProteins,
      recommendations,
    )

    const withReasons = recommendations.map((item) => ({
      ...item,
      reason: reasonMap.get(item.recipe.id) ?? null,
    }))

    return RecipeRecommendationsApiModel.from(withReasons)
  }

  public async getPantryMatchRecipes(
    user: User,
    languageCode: LanguageCode,
    dto: PantryMatchDto,
  ): Promise<PantryMatchRecipesApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()
    const limit = dto.limit ?? 10
    const minCoveragePercent = dto.minCoveragePercent ?? 0
    const pantry = normalizePantryItems(dto.items)

    const recipes = await this.recipeRepository.findRecipesForPantryMatch(user.id, pantry.productIds, [
      language.id,
      defaultLanguage.id,
    ])

    const items: PantryMatchItem[] = recipes
      .map((recipe) => {
        const recipeListItem = this.mapRecipeListItem(recipe, language.id, defaultLanguage.id, user.id)
        const totalIngredientsCount = recipe.ingredients.length

        if (totalIngredientsCount === 0) {
          return null
        }

        let matchedIngredientsCount = 0
        let quantitySufficientCount = 0
        const missingIngredients: PantryMissingIngredient[] = []

        for (const ingredient of recipe.ingredients) {
          const ingredientQuantity = Number(ingredient.quantity)
          const hasProduct = pantry.productIdSet.has(ingredient.productId)

          if (hasProduct) {
            matchedIngredientsCount += 1

            const quantityKey = buildCompositeKey(ingredient.productId, ingredient.measurementUnitId)
            const pantryQuantity = pantry.quantityByProductUnit.get(quantityKey)

            if (pantryQuantity !== undefined && pantryQuantity >= ingredientQuantity) {
              quantitySufficientCount += 1
            }

            continue
          }

          const productTranslation = pickTranslationByLanguage(
            ingredient.product.translations,
            language.id,
            defaultLanguage.id,
          )
          const measurementUnitTranslation = pickTranslationByLanguage(
            ingredient.measurementUnit.translations,
            language.id,
            defaultLanguage.id,
          )

          missingIngredients.push({
            productId: ingredient.productId,
            productName: productTranslation?.name ?? ingredient.product.slug,
            measurementUnitKey: ingredient.measurementUnit.key,
            measurementUnitLabel: measurementUnitTranslation?.label ?? ingredient.measurementUnit.key,
            quantity: ingredientQuantity,
          })
        }

        const coveragePercent = (matchedIngredientsCount / totalIngredientsCount) * 100

        return {
          recipe: recipeListItem,
          coveragePercent: Math.round(coveragePercent * 100) / 100,
          matchedIngredientsCount,
          totalIngredientsCount,
          quantitySufficientCount,
          missingIngredients,
        }
      })
      .filter((item): item is PantryMatchItem => !!item)
      .filter((item) => item.coveragePercent >= minCoveragePercent)
      .sort((a, b) => {
        if (b.coveragePercent !== a.coveragePercent) {
          return b.coveragePercent - a.coveragePercent
        }

        if (b.quantitySufficientCount !== a.quantitySufficientCount) {
          return b.quantitySufficientCount - a.quantitySufficientCount
        }

        return b.matchedIngredientsCount - a.matchedIngredientsCount
      })
      .slice(0, limit)

    return PantryMatchRecipesApiModel.from(items)
  }

  public async getRecipeSubstitutions(
    recipeId: Uuid,
    user: User,
    languageCode: LanguageCode,
    dto: RecipeSubstitutionsDto,
  ): Promise<RecipeSubstitutionsApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()
    const ingredientProductId = <Uuid>hashToUuid(dto.ingredientProductId)

    if (!isUuid(ingredientProductId)) {
      throw new AppBadRequestException(
        'recipe.substitution-ingredient-not-found',
        'Ingredient product is not part of the selected recipe.',
      )
    }

    const recipe = await this.recipeRepository.findRecipeForSubstitutions(recipeId, [language.id, defaultLanguage.id])

    if (!recipe) {
      throw AppEntityNotFoundException.byId('Recipe', recipeId)
    }

    const canUseRecipe = this.canUseRecipeForSuggestions(recipe.status, recipe.authorId, user)

    if (!canUseRecipe) {
      throw AppEntityNotFoundException.byId('Recipe', recipeId)
    }

    const ingredient = recipe.ingredients.find((recipeIngredient) => recipeIngredient.productId === ingredientProductId)

    if (!ingredient) {
      throw new AppBadRequestException(
        'recipe.substitution-ingredient-not-found',
        'Ingredient product is not part of the selected recipe.',
      )
    }

    const excludeProductIds = [
      ingredientProductId,
      ...(dto.excludeProductIds ?? []).map((id) => <Uuid>hashToUuid(id)).filter((id): id is Uuid => isUuid(id)),
    ]

    const limit = dto.limit ?? 10
    const candidates = await this.recipeRepository.findProductsForSubstitutions(
      ingredient.product.measurementBaseTypeId,
      user.id,
      [...new Set(excludeProductIds)],
      [language.id, defaultLanguage.id],
      Math.max(limit * 3, limit),
    )

    const substitutions: RecipeSubstitutionItem[] = candidates
      .map((candidate) => {
        const translation = pickTranslationByLanguage(candidate.translations, language.id, defaultLanguage.id)
        const unitTranslation = candidate.measurementUnit
          ? pickTranslationByLanguage(candidate.measurementUnit.translations, language.id, defaultLanguage.id)
          : null

        return {
          productId: candidate.id,
          name: translation?.name ?? candidate.slug,
          measurementUnitKey: candidate.measurementUnit?.key ?? null,
          measurementUnitLabel: unitTranslation?.label ?? candidate.measurementUnit?.key ?? null,
          isSystem: candidate.isSystem,
          usageCount: candidate._count.recipeIngredients,
          reason: null,
        }
      })
      .sort((a, b) => {
        if (a.isSystem !== b.isSystem) {
          return a.isSystem ? -1 : 1
        }

        if (b.usageCount !== a.usageCount) {
          return b.usageCount - a.usageCount
        }

        return a.name.localeCompare(b.name)
      })
      .slice(0, limit)

    const ingredientTranslation = pickTranslationByLanguage(
      ingredient.product.translations,
      language.id,
      defaultLanguage.id,
    )
    const reasonMap = await this.tryExplainIngredientSubstitutions(
      language.code,
      ingredientTranslation?.name ?? ingredient.product.slug,
      substitutions,
    )

    const withReasons = substitutions.map((substitution) => ({
      ...substitution,
      reason: reasonMap.get(substitution.productId) ?? null,
    }))

    return RecipeSubstitutionsApiModel.from(withReasons)
  }

  private async findPaginatedRecipes(
    query: RecipeQueryDto,
    languageIds: Uuid[],
    options?: {
      viewerUserId?: Uuid
      favoritesByUserId?: Uuid
    },
  ): Promise<PaginatedResult<RecipeListItem>> {
    const { filter, pagination } = query

    const baseWhere = this.recipeRepository.prepareRecipeWhereInput(
      {
        ...(filter ?? {}),
        status: RecipeStatus.PUBLISHED,
      },
      languageIds,
    )
    const where = {
      ...baseWhere,
      ...(options?.favoritesByUserId
        ? {
            favorites: {
              some: {
                userId: options.favoritesByUserId,
              },
            },
          }
        : {}),
    }

    const sort = this.recipeRepository.prepareRecipeSortInput(query.sort)

    const paginatedRecipes = await this.paginationService.paginate({
      ...(pagination ?? {}),
      countFn: () => this.recipeRepository.getTotalRecipesCount(where),
      itemsFn: (skip, take) =>
        this.recipeRepository.getPaginatedRecipeItems(where, sort, skip, take, languageIds, options?.viewerUserId),
    })

    return {
      ...paginatedRecipes,
      items: paginatedRecipes.items.map((recipe) =>
        this.mapRecipeListItem(recipe, languageIds[0], languageIds[1], options?.viewerUserId),
      ),
    }
  }

  private mapRecipeListItem(
    recipe: Awaited<ReturnType<RecipeRepository['getPaginatedRecipeItems']>>[number],
    languageId: Uuid,
    defaultLanguageId: Uuid,
    viewerUserId?: Uuid,
  ): RecipeListItem {
    const translation = pickTranslationByLanguage(recipe.translations, languageId, defaultLanguageId)
    const difficultyTranslation = pickTranslationByLanguage(
      recipe.difficulty.translations,
      languageId,
      defaultLanguageId,
    )

    return {
      id: recipe.id,
      slug: recipe.slug,
      status: recipe.status,
      title: translation?.title ?? '',
      description: translation?.description ?? null,
      cookingTimeMinutes: recipe.cookingTimeMinutes,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
      likesCount: recipe.likesCount,
      favoritesCount: recipe.favoritesCount,
      viewsCount: recipe.viewsCount,
      isLiked: viewerUserId ? recipe.likes.length > 0 : null,
      isFavorite: viewerUserId ? recipe.favorites.length > 0 : null,
      difficultyKey: recipe.difficulty.key,
      difficultyLabel: difficultyTranslation?.label ?? recipe.difficulty.key,
      author: {
        id: recipe.author.id,
        firstName: recipe.author.firstName,
        lastName: recipe.author.lastName,
      },
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    }
  }

  private mapRecipeDetails(
    recipe: NonNullable<Awaited<ReturnType<RecipeRepository['findRecipeById']>>>,
    languageId: Uuid,
    defaultLanguageId: Uuid,
    viewerUserId?: Uuid,
  ): RecipeDetails {
    const recipeBase = this.mapRecipeListItem(recipe, languageId, defaultLanguageId, viewerUserId)

    const steps = recipe.steps.map((step) => {
      const stepTranslation = pickTranslationByLanguage(step.translations, languageId, defaultLanguageId)

      return {
        sortOrder: step.sortOrder,
        content: stepTranslation?.content ?? '',
      }
    })

    const ingredients = recipe.ingredients.map((ingredient) => {
      const productTranslation = pickTranslationByLanguage(
        ingredient.product.translations,
        languageId,
        defaultLanguageId,
      )
      const measurementUnitTranslation = pickTranslationByLanguage(
        ingredient.measurementUnit.translations,
        languageId,
        defaultLanguageId,
      )

      return {
        productId: ingredient.productId,
        productName: productTranslation?.name ?? ingredient.product.slug,
        measurementUnitKey: ingredient.measurementUnit.key,
        measurementUnitLabel: measurementUnitTranslation?.label ?? ingredient.measurementUnit.key,
        quantity: Number(ingredient.quantity),
        note: ingredient.note,
      }
    })

    return {
      ...recipeBase,
      sourceLanguageCode: recipe.sourceLanguage?.code,
      steps,
      ingredients,
      nutrition: recipe.nutrition
        ? {
            kcal: this.decimalToNumber(recipe.nutrition.kcal),
            proteins: this.decimalToNumber(recipe.nutrition.proteins),
            fats: this.decimalToNumber(recipe.nutrition.fats),
            carbs: this.decimalToNumber(recipe.nutrition.carbs),
            fiber: this.decimalToNumber(recipe.nutrition.fiber),
            sugar: this.decimalToNumber(recipe.nutrition.sugar),
            sodiumMg: this.decimalToNumber(recipe.nutrition.sodiumMg),
            isEstimated: recipe.nutrition.isEstimated,
          }
        : null,
    }
  }

  private prepareIngredientPayload(
    ingredients: RecipeIngredientInputDto[],
  ): Array<{ productId: Uuid; measurementUnitId: Uuid; quantity: number; note?: string; sortOrder: number }> {
    return ingredients.map((ingredient, index) => ({
      productId: <Uuid>hashToUuid(ingredient.productId),
      measurementUnitId: <Uuid>hashToUuid(ingredient.measurementUnitId),
      quantity: ingredient.quantity,
      note: ingredient.note,
      sortOrder: index,
    }))
  }

  private async validateIngredientRelations(
    ingredients: Array<{
      productId: Uuid
      measurementUnitId: Uuid
      quantity: number
      sortOrder: number
      note?: string
    }>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const productIds = [...new Set(ingredients.map((ingredient) => ingredient.productId))]
    const measurementUnitIds = [...new Set(ingredients.map((ingredient) => ingredient.measurementUnitId))]

    const [products, measurementUnits] = await Promise.all([
      this.recipeRepository.findProductsByIds(productIds, tx),
      this.recipeRepository.findMeasurementUnitsByIds(measurementUnitIds, tx),
    ])

    const productsMap = new Map(products.map((product) => [product.id, product]))
    const measurementUnitsMap = new Map(measurementUnits.map((unit) => [unit.id, unit]))

    for (const ingredient of ingredients) {
      const product = productsMap.get(ingredient.productId)

      if (!product) {
        throw AppEntityNotFoundException.byId('Product', ingredient.productId)
      }

      const measurementUnit = measurementUnitsMap.get(ingredient.measurementUnitId)

      if (!measurementUnit) {
        throw AppEntityNotFoundException.byId('MeasurementUnit', ingredient.measurementUnitId)
      }

      if (product.measurementBaseTypeId !== measurementUnit.baseTypeId) {
        throw new AppBadRequestException(
          'recipe.ingredient-unit-mismatch',
          'Ingredient measurement unit is not compatible with product base type.',
          {
            productId: ingredient.productId,
            measurementUnitId: ingredient.measurementUnitId,
          },
        )
      }
    }
  }

  private prepareRecipeStepCreateData(
    steps: RecipeStepInputDto[],
    languageId: Uuid,
  ): Prisma.RecipeStepCreateWithoutRecipeInput[] {
    return steps.map((step, index) => ({
      sortOrder: index + 1,
      translations: {
        create: {
          language: {
            connect: {
              id: languageId,
            },
          },
          content: step.content,
          isAutoTranslated: false,
        },
      },
    }))
  }

  private prepareNutritionCreateData(
    nutrition: RecipeNutritionInputDto,
  ): Prisma.RecipeNutritionCreateWithoutRecipeInput {
    return {
      kcal: nutrition.kcal,
      proteins: nutrition.proteins,
      fats: nutrition.fats,
      carbs: nutrition.carbs,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      sodiumMg: nutrition.sodiumMg,
      isEstimated: nutrition.isEstimated ?? false,
      updatedByAiAt: nutrition.isEstimated ? new Date() : null,
    }
  }

  private prepareNutritionUpdateData(
    nutrition: RecipeNutritionInputDto,
  ): Prisma.RecipeNutritionUpdateWithoutRecipeInput {
    return {
      ...(nutrition.kcal !== undefined ? { kcal: nutrition.kcal } : {}),
      ...(nutrition.proteins !== undefined ? { proteins: nutrition.proteins } : {}),
      ...(nutrition.fats !== undefined ? { fats: nutrition.fats } : {}),
      ...(nutrition.carbs !== undefined ? { carbs: nutrition.carbs } : {}),
      ...(nutrition.fiber !== undefined ? { fiber: nutrition.fiber } : {}),
      ...(nutrition.sugar !== undefined ? { sugar: nutrition.sugar } : {}),
      ...(nutrition.sodiumMg !== undefined ? { sodiumMg: nutrition.sodiumMg } : {}),
      ...(nutrition.isEstimated !== undefined ? { isEstimated: nutrition.isEstimated } : {}),
      ...(nutrition.isEstimated === true ? { updatedByAiAt: new Date() } : {}),
    }
  }

  private async createRecipeTranslationJobs(
    recipeId: Uuid,
    sourceLanguageId: Uuid,
    userId: Uuid,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const targetLanguages = await tx.language.findMany({
      where: {
        id: {
          not: sourceLanguageId,
        },
      },
      select: {
        id: true,
      },
    })

    if (targetLanguages.length === 0) {
      return
    }

    await tx.backgroundJob.createMany({
      data: targetLanguages.map((targetLanguage) => ({
        type: BackgroundJobType.RECIPE_TRANSLATION,
        status: 'PENDING',
        userId,
        dedupKey: `recipe-translation:${recipeId}:${targetLanguage.id}:${randomHash()}`,
        payload: {
          recipeId,
          sourceLanguageId,
          targetLanguageId: targetLanguage.id,
        },
      })),
    })
  }

  private async generateUniqueSlug(title: string, tx: Prisma.TransactionClient): Promise<string> {
    const baseSlug = slugifyText(title) || `recipe-${toLowerCase(randomHash()).slice(0, 8)}`

    for (let attempt = 0; attempt < 10; attempt++) {
      const suffix = attempt > 0 ? `-${toLowerCase(randomHash()).slice(0, 6)}` : ''
      const slug = `${baseSlug}${suffix}`

      const slugExists = await this.recipeRepository.isRecipeSlugExists(slug, tx)

      if (!slugExists) {
        return slug
      }
    }

    return `${baseSlug}-${toLowerCase(randomHash()).slice(0, 8)}`
  }

  private decimalToNumber(value?: Prisma.Decimal | null): number | null {
    return value === undefined || value === null ? null : Number(value)
  }

  private async tryExplainRecipeRecommendations(
    languageCode: LanguageCode,
    targetCalories: number,
    targetProteins: number,
    recommendations: RecipeRecommendationItem[],
  ): Promise<Map<string, string>> {
    if (recommendations.length === 0) {
      return new Map()
    }

    try {
      const request: GenerateStructuredJsonInput = {
        schemaName: 'recipe_recommendation_explanations',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['recipeId', 'reason'],
                properties: {
                  recipeId: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        systemPrompt:
          'You are a nutrition assistant. Return only valid JSON. Each reason must be concise, factual, and tailored to user targets.',
        userContent: [
          {
            type: 'text',
            text: [
              `Language: ${getLanguageLabelByCode(languageCode)}.`,
              `Daily calorie target: ${targetCalories}.`,
              `Daily protein target: ${targetProteins}.`,
              'Return short reason (max 20 words) for each recipe why it matches the target.',
              `Recipes: ${JSON.stringify(
                recommendations.map((recommendation) => ({
                  recipeId: recommendation.recipe.id,
                  title: recommendation.recipe.title,
                  caloriesPerServing: recommendation.matchMeta.caloriesPerServing,
                  proteinsPerServing: recommendation.matchMeta.proteinsPerServing ?? null,
                  score: recommendation.score,
                })),
              )}`,
            ].join('\n\n'),
          },
        ],
      }

      const response = await this.aiProvider.generateStructuredJson(request)
      const reasons = normalizeExplanationItems(response.items, 'recipeId')

      return new Map(
        reasons.filter((item) => item.reason.trim().length > 0).map((item) => [item.id, item.reason.trim()]),
      )
    } catch {
      return new Map()
    }
  }

  private async tryExplainIngredientSubstitutions(
    languageCode: LanguageCode,
    ingredientName: string,
    substitutions: RecipeSubstitutionItem[],
  ): Promise<Map<string, string>> {
    if (substitutions.length === 0) {
      return new Map()
    }

    try {
      const request: GenerateStructuredJsonInput = {
        schemaName: 'ingredient_substitution_explanations',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['productId', 'reason'],
                properties: {
                  productId: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        systemPrompt:
          'You are a culinary assistant. Return only valid JSON. Reasons must be concise and explain substitution suitability.',
        userContent: [
          {
            type: 'text',
            text: [
              `Language: ${getLanguageLabelByCode(languageCode)}.`,
              `Original ingredient: ${ingredientName}.`,
              'Return short reason (max 20 words) for each substitution candidate.',
              `Substitutions: ${JSON.stringify(
                substitutions.map((substitution) => ({
                  productId: substitution.productId,
                  name: substitution.name,
                  measurementUnitLabel: substitution.measurementUnitLabel ?? null,
                })),
              )}`,
            ].join('\n\n'),
          },
        ],
      }

      return new Map(
        normalizeExplanationItems((await this.aiProvider.generateStructuredJson(request)).items, 'productId')
          .filter((item) => item.reason.trim().length > 0)
          .map((item) => [item.id, item.reason.trim()]),
      )
    } catch {
      return new Map()
    }
  }

  private canUseRecipeForSuggestions(status: RecipeStatus, authorId: Uuid, user: User): boolean {
    if (status === RecipeStatus.PUBLISHED) {
      return true
    }

    return this.canManageRecipe(authorId, user)
  }

  private async ensureRecipeIsAvailableForInteractions(
    recipeId: Uuid,
    user: User,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const recipe = await this.recipeRepository.findRecipeForAccess(recipeId, tx)

    if (!recipe) {
      throw AppEntityNotFoundException.byId('Recipe', recipeId)
    }

    if (recipe.status === RecipeStatus.PUBLISHED) {
      return
    }

    const canManage = this.canManageRecipe(recipe.authorId, user)

    if (canManage) {
      return
    }

    throw AppEntityNotFoundException.byId('Recipe', recipeId)
  }

  private canManageRecipe(authorId: Uuid, user?: User): boolean {
    if (!user) {
      return false
    }

    return user.role === UserRole.ADMIN || user.id === authorId
  }

  private enforceRecipeOwnerAccess(authorId: Uuid, user: User): void {
    const canManage = this.canManageRecipe(authorId, user)

    if (canManage) {
      return
    }

    throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
  }
}
