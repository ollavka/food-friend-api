import { Injectable } from '@nestjs/common'
import { LanguageCode, Prisma } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class SearchRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findAllLanguageCodes(): Promise<LanguageCode[]> {
    const languages = await this.prismaService.language.findMany({
      select: {
        code: true,
      },
    })

    return languages.map((language) => language.code)
  }

  public async findProductsForIndexing(productIds?: Uuid[]): Promise<
    Prisma.ProductGetPayload<{
      include: {
        measurementBaseType: {
          select: {
            key: true
          }
        }
        measurementUnit: {
          select: {
            key: true
          }
        }
        translations: {
          include: {
            language: {
              select: {
                code: true
              }
            }
          }
        }
      }
    }>[]
  > {
    return this.prismaService.product.findMany({
      where: productIds
        ? {
            id: {
              in: productIds,
            },
          }
        : undefined,
      include: {
        measurementBaseType: {
          select: {
            key: true,
          },
        },
        measurementUnit: {
          select: {
            key: true,
          },
        },
        translations: {
          include: {
            language: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    })
  }

  public async findRecipesForIndexing(recipeIds?: Uuid[]): Promise<
    Prisma.RecipeGetPayload<{
      include: {
        translations: {
          include: {
            language: {
              select: {
                code: true
              }
            }
          }
        }
        difficulty: {
          include: {
            translations: {
              include: {
                language: {
                  select: {
                    code: true
                  }
                }
              }
            }
          }
        }
        author: {
          select: {
            id: true
            firstName: true
            lastName: true
          }
        }
      }
    }>[]
  > {
    return this.prismaService.recipe.findMany({
      where: recipeIds
        ? {
            id: {
              in: recipeIds,
            },
          }
        : undefined,
      include: {
        translations: {
          include: {
            language: {
              select: {
                code: true,
              },
            },
          },
        },
        difficulty: {
          include: {
            translations: {
              include: {
                language: {
                  select: {
                    code: true,
                  },
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
      },
    })
  }
}
