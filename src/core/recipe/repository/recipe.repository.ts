import { Injectable } from '@nestjs/common'
import {
  MeasurementBaseTypeKey,
  MeasurementUnitKey,
  Prisma,
  Product,
  Recipe,
  RecipeDifficultyKey,
  RecipeStatus,
  RecipeStepTranslation,
  RecipeTranslation,
} from '@prisma/client'
import { SortFieldQuery, Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'
import { RecipeFilterQueryDto } from '../dto'
import { RecipeSortField } from '../type'

@Injectable()
export class RecipeRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findRecipeById(
    id: Uuid,
    languageIds: Uuid[],
    viewerUserId?: Uuid,
  ): Promise<Prisma.RecipeGetPayload<{
    include: {
      translations: true
      steps: {
        include: {
          translations: true
        }
      }
      ingredients: {
        include: {
          product: {
            include: {
              translations: true
            }
          }
          measurementUnit: {
            include: {
              translations: true
            }
          }
        }
      }
      nutrition: true
      difficulty: {
        include: {
          translations: true
        }
      }
      author: {
        select: {
          id: true
          firstName: true
          lastName: true
        }
      }
      sourceLanguage: {
        select: {
          code: true
        }
      }
      likes: {
        select: {
          id: true
        }
      }
      favorites: {
        select: {
          id: true
        }
      }
    }
  }> | null> {
    return this.prismaService.recipe.findUnique({
      where: {
        id,
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        steps: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
        ingredients: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            product: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
            measurementUnit: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
          },
        },
        nutrition: true,
        difficulty: {
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sourceLanguage: {
          select: {
            code: true,
          },
        },
        likes: {
          where: {
            userId: viewerUserId ?? '',
          },
          select: {
            id: true,
          },
        },
        favorites: {
          where: {
            userId: viewerUserId ?? '',
          },
          select: {
            id: true,
          },
        },
      },
    })
  }

  public async findRecipeForAccess(
    id: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<Pick<Recipe, 'id' | 'authorId' | 'status' | 'publishedAt'> | null> {
    const db = tx ?? this.prismaService

    return db.recipe.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        authorId: true,
        status: true,
        publishedAt: true,
      },
    })
  }

  public async findRecipeForImageGenerationAccess(
    id: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<Pick<Recipe, 'id' | 'authorId' | 'status' | 'imageKey'> | null> {
    const db = tx ?? this.prismaService

    return db.recipe.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        authorId: true,
        status: true,
        imageKey: true,
      },
    })
  }

  public async findRecipeForTranslation(
    recipeId: Uuid,
    sourceLanguageId: Uuid,
    targetLanguageId: Uuid,
  ): Promise<Prisma.RecipeGetPayload<{
    include: {
      translations: true
      steps: {
        include: {
          translations: true
        }
      }
    }
  }> | null> {
    return this.prismaService.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: [sourceLanguageId, targetLanguageId],
            },
          },
        },
        steps: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            translations: {
              where: {
                languageId: {
                  in: [sourceLanguageId, targetLanguageId],
                },
              },
            },
          },
        },
      },
    })
  }

  public async findRecipeForImageGeneration(
    recipeId: Uuid,
    languageIds: Uuid[],
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.RecipeGetPayload<{
    include: {
      translations: true
      steps: {
        include: {
          translations: true
        }
      }
    }
  }> | null> {
    const db = tx ?? this.prismaService

    return db.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        steps: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
      },
    })
  }

  public async updateRecipeImage(
    recipeId: Uuid,
    data: Pick<Prisma.RecipeUpdateInput, 'imageKey' | 'imageUrl'>,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = tx ?? this.prismaService

    await db.recipe.update({
      where: {
        id: recipeId,
      },
      data,
    })
  }

  public async upsertRecipeTranslation(
    recipeId: Uuid,
    targetLanguageId: Uuid,
    data: { title: string; description?: string | null },
    tx?: Prisma.TransactionClient,
  ): Promise<{ updated: boolean; skippedManual: boolean; translation: RecipeTranslation | null }> {
    const db = tx ?? this.prismaService

    const existingTranslation = await db.recipeTranslation.findUnique({
      where: {
        recipeId_languageId: {
          recipeId,
          languageId: targetLanguageId,
        },
      },
    })

    if (existingTranslation && !existingTranslation.isAutoTranslated) {
      return {
        updated: false,
        skippedManual: true,
        translation: existingTranslation,
      }
    }

    const translation = await db.recipeTranslation.upsert({
      where: {
        recipeId_languageId: {
          recipeId,
          languageId: targetLanguageId,
        },
      },
      create: {
        recipe: {
          connect: {
            id: recipeId,
          },
        },
        language: {
          connect: {
            id: targetLanguageId,
          },
        },
        title: data.title,
        description: data.description,
        isAutoTranslated: true,
      },
      update: {
        title: data.title,
        description: data.description,
        isAutoTranslated: true,
      },
    })

    return {
      updated: true,
      skippedManual: false,
      translation,
    }
  }

  public async upsertRecipeStepTranslation(
    stepId: Uuid,
    targetLanguageId: Uuid,
    content: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ updated: boolean; skippedManual: boolean; translation: RecipeStepTranslation | null }> {
    const db = tx ?? this.prismaService

    const existingTranslation = await db.recipeStepTranslation.findUnique({
      where: {
        stepId_languageId: {
          stepId,
          languageId: targetLanguageId,
        },
      },
    })

    if (existingTranslation && !existingTranslation.isAutoTranslated) {
      return {
        updated: false,
        skippedManual: true,
        translation: existingTranslation,
      }
    }

    const translation = await db.recipeStepTranslation.upsert({
      where: {
        stepId_languageId: {
          stepId,
          languageId: targetLanguageId,
        },
      },
      create: {
        step: {
          connect: {
            id: stepId,
          },
        },
        language: {
          connect: {
            id: targetLanguageId,
          },
        },
        content,
        isAutoTranslated: true,
      },
      update: {
        content,
        isAutoTranslated: true,
      },
    })

    return {
      updated: true,
      skippedManual: false,
      translation,
    }
  }

  public async findMeasurementUnitsByKeys(
    keys: MeasurementUnitKey[],
    tx?: Prisma.TransactionClient,
  ): Promise<Array<{ id: Uuid; key: MeasurementUnitKey; baseTypeKey: MeasurementBaseTypeKey }>> {
    const db = tx ?? this.prismaService

    const units = await db.measurementUnit.findMany({
      where: {
        key: {
          in: keys,
        },
      },
      select: {
        id: true,
        key: true,
        baseType: {
          select: {
            key: true,
          },
        },
      },
    })

    return units.map((unit) => ({
      id: <Uuid>unit.id,
      key: unit.key,
      baseTypeKey: unit.baseType.key,
    }))
  }

  public async findProductsForIngredientMatching(
    languageId: Uuid,
    userId: Uuid,
    names: string[],
    slugs: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<
    Array<{
      id: Uuid
      slug: string
      translationName: string | null
    }>
  > {
    const db = tx ?? this.prismaService

    if (names.length === 0 && slugs.length === 0) {
      return []
    }

    const whereExpressions: Prisma.ProductWhereInput[] = [
      ...names.map((name) => ({
        translations: {
          some: {
            languageId,
            name: {
              equals: name,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      })),
      ...slugs.map((slug) => ({
        slug: {
          equals: slug,
          mode: Prisma.QueryMode.insensitive,
        },
      })),
    ]

    const products = await db.product.findMany({
      where: {
        OR: [{ isSystem: true }, { ownerId: userId }],
        AND: [
          {
            OR: whereExpressions,
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        translations: {
          where: {
            languageId,
          },
          select: {
            name: true,
          },
          take: 1,
        },
      },
    })

    return products.map((product) => ({
      id: <Uuid>product.id,
      slug: product.slug,
      translationName: product.translations[0]?.name ?? null,
    }))
  }

  public async findRecipeTranslationByLanguage(
    recipeId: Uuid,
    languageId: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<RecipeTranslation | null> {
    const db = tx ?? this.prismaService

    return db.recipeTranslation.findUnique({
      where: {
        recipeId_languageId: {
          recipeId,
          languageId,
        },
      },
    })
  }

  public async getTotalRecipesCount(where: Prisma.RecipeWhereInput): Promise<number> {
    return this.prismaService.recipe.count({ where })
  }

  public async getPaginatedRecipeItems(
    where: Prisma.RecipeWhereInput,
    sort: Prisma.RecipeOrderByWithRelationInput,
    skip: number,
    take: number,
    languageIds: Uuid[],
    viewerUserId?: Uuid,
  ): Promise<
    Prisma.RecipeGetPayload<{
      include: {
        translations: true
        difficulty: {
          include: {
            translations: true
          }
        }
        author: {
          select: {
            id: true
            firstName: true
            lastName: true
          }
        }
        likes: {
          select: {
            id: true
          }
        }
        favorites: {
          select: {
            id: true
          }
        }
      }
    }>[]
  > {
    return this.prismaService.recipe.findMany({
      where,
      skip,
      take,
      orderBy: sort,
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        difficulty: {
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        likes: {
          where: {
            userId: viewerUserId ?? '',
          },
          select: {
            id: true,
          },
        },
        favorites: {
          where: {
            userId: viewerUserId ?? '',
          },
          select: {
            id: true,
          },
        },
      },
    })
  }

  public async findRecipesForRecommendations(
    userId: Uuid,
    languageIds: Uuid[],
    params: {
      limit: number
      maxCookingTimeMinutes?: number
      difficulty?: RecipeDifficultyKey
    },
  ): Promise<
    Prisma.RecipeGetPayload<{
      include: {
        translations: true
        difficulty: {
          include: {
            translations: true
          }
        }
        author: {
          select: {
            id: true
            firstName: true
            lastName: true
          }
        }
        nutrition: true
        likes: {
          select: {
            id: true
          }
        }
        favorites: {
          select: {
            id: true
          }
        }
      }
    }>[]
  > {
    return this.prismaService.recipe.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                status: RecipeStatus.PUBLISHED,
              },
              {
                authorId: userId,
                status: {
                  in: [RecipeStatus.DRAFT, RecipeStatus.PUBLISHED],
                },
              },
            ],
          },
          {
            nutrition: {
              is: {
                kcal: {
                  not: null,
                },
              },
            },
          },
          ...(params.maxCookingTimeMinutes !== undefined
            ? [
                {
                  cookingTimeMinutes: {
                    lte: params.maxCookingTimeMinutes,
                  },
                },
              ]
            : []),
          ...(params.difficulty !== undefined
            ? [
                {
                  difficulty: {
                    key: params.difficulty,
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        difficulty: {
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        nutrition: true,
        likes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        favorites: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
      take: params.limit,
    })
  }

  public async findRecipesForPantryMatch(
    userId: Uuid,
    productIds: Uuid[],
    languageIds: Uuid[],
  ): Promise<
    Prisma.RecipeGetPayload<{
      include: {
        translations: true
        difficulty: {
          include: {
            translations: true
          }
        }
        author: {
          select: {
            id: true
            firstName: true
            lastName: true
          }
        }
        likes: {
          select: {
            id: true
          }
        }
        favorites: {
          select: {
            id: true
          }
        }
        ingredients: {
          include: {
            product: {
              include: {
                translations: true
              }
            }
            measurementUnit: {
              include: {
                translations: true
              }
            }
          }
        }
      }
    }>[]
  > {
    return this.prismaService.recipe.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                status: RecipeStatus.PUBLISHED,
              },
              {
                authorId: userId,
                status: {
                  in: [RecipeStatus.DRAFT, RecipeStatus.PUBLISHED],
                },
              },
            ],
          },
          {
            ingredients: {
              some: {
                productId: {
                  in: productIds,
                },
              },
            },
          },
        ],
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        difficulty: {
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        likes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        favorites: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        ingredients: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            product: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
            measurementUnit: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  public async findRecipeForSubstitutions(
    recipeId: Uuid,
    languageIds: Uuid[],
  ): Promise<Prisma.RecipeGetPayload<{
    include: {
      translations: true
      ingredients: {
        include: {
          product: {
            include: {
              translations: true
            }
          }
          measurementUnit: {
            include: {
              translations: true
            }
          }
        }
      }
    }
  }> | null> {
    return this.prismaService.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        ingredients: {
          include: {
            product: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
            measurementUnit: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  public async findProductsForSubstitutions(
    measurementBaseTypeId: Uuid,
    userId: Uuid,
    excludeProductIds: Uuid[],
    languageIds: Uuid[],
    take: number,
  ): Promise<
    Prisma.ProductGetPayload<{
      include: {
        translations: true
        measurementUnit: {
          include: {
            translations: true
          }
        }
        _count: {
          select: {
            recipeIngredients: true
          }
        }
      }
    }>[]
  > {
    return this.prismaService.product.findMany({
      where: {
        measurementBaseTypeId,
        id: {
          notIn: excludeProductIds,
        },
        OR: [{ isSystem: true }, { ownerId: userId }],
      },
      include: {
        translations: {
          where: {
            languageId: {
              in: languageIds,
            },
          },
        },
        measurementUnit: {
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
        _count: {
          select: {
            recipeIngredients: true,
          },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { recipeIngredients: { _count: 'desc' } }, { createdAt: 'desc' }],
      take,
    })
  }

  public prepareRecipeWhereInput(filter: RecipeFilterQueryDto, languageIds: Uuid[]): Prisma.RecipeWhereInput {
    const { difficulty, search, status } = filter

    return {
      ...(status ? { status } : {}),
      ...(difficulty
        ? {
            difficulty: {
              key: difficulty,
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                slug: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                translations: {
                  some: {
                    languageId: {
                      in: languageIds,
                    },
                    OR: [
                      {
                        title: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        description: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    }
  }

  public prepareRecipeSortInput(sort?: SortFieldQuery<RecipeSortField>): Prisma.RecipeOrderByWithRelationInput {
    const { field, order = 'desc' } = sort ?? {}

    if (!field) {
      return {
        createdAt: 'desc',
      }
    }

    return {
      [field]: order,
    }
  }

  public async findProductsByIds(
    ids: Uuid[],
    tx?: Prisma.TransactionClient,
  ): Promise<Array<Pick<Product, 'id' | 'measurementBaseTypeId'>>> {
    const db = tx ?? this.prismaService

    return db.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        measurementBaseTypeId: true,
      },
    })
  }

  public async findMeasurementUnitsByIds(
    ids: Uuid[],
    tx?: Prisma.TransactionClient,
  ): Promise<Array<{ id: string; baseTypeId: string }>> {
    const db = tx ?? this.prismaService

    return db.measurementUnit.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        baseTypeId: true,
      },
    })
  }

  public async createRecipe(data: Prisma.RecipeCreateInput, tx?: Prisma.TransactionClient): Promise<Recipe> {
    const db = tx ?? this.prismaService

    return db.recipe.create({
      data,
    })
  }

  public async updateRecipe(id: Uuid, data: Prisma.RecipeUpdateInput, tx?: Prisma.TransactionClient): Promise<Recipe> {
    const db = tx ?? this.prismaService

    return db.recipe.update({
      where: {
        id,
      },
      data,
    })
  }

  public async createRecipeLikeIfNotExists(
    recipeId: Uuid,
    userId: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const db = tx ?? this.prismaService

    const created = await db.recipeLike.createMany({
      data: {
        recipeId,
        userId,
      },
      skipDuplicates: true,
    })

    return created.count > 0
  }

  public async removeRecipeLike(recipeId: Uuid, userId: Uuid, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prismaService

    const deleted = await db.recipeLike.deleteMany({
      where: {
        recipeId,
        userId,
      },
    })

    return deleted.count > 0
  }

  public async createRecipeFavoriteIfNotExists(
    recipeId: Uuid,
    userId: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const db = tx ?? this.prismaService

    const created = await db.recipeFavorite.createMany({
      data: {
        recipeId,
        userId,
      },
      skipDuplicates: true,
    })

    return created.count > 0
  }

  public async removeRecipeFavorite(recipeId: Uuid, userId: Uuid, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prismaService

    const deleted = await db.recipeFavorite.deleteMany({
      where: {
        recipeId,
        userId,
      },
    })

    return deleted.count > 0
  }

  public async incrementRecipeLikes(id: Uuid, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prismaService

    await db.recipe.update({
      where: {
        id,
      },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    })
  }

  public async decrementRecipeLikes(id: Uuid, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prismaService

    await db.recipe.update({
      where: {
        id,
      },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    })
  }

  public async incrementRecipeFavorites(id: Uuid, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prismaService

    await db.recipe.update({
      where: {
        id,
      },
      data: {
        favoritesCount: {
          increment: 1,
        },
      },
    })
  }

  public async decrementRecipeFavorites(id: Uuid, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prismaService

    await db.recipe.update({
      where: {
        id,
      },
      data: {
        favoritesCount: {
          decrement: 1,
        },
      },
    })
  }

  public async isRecipeSlugExists(slug: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prismaService

    const recipe = await db.recipe.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    })

    return !!recipe
  }

  public async incrementRecipeViews(id: Uuid, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prismaService

    await db.recipe.update({
      where: {
        id,
      },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    })
  }
}
