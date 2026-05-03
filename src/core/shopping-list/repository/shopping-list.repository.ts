import { Injectable } from '@nestjs/common'
import { Prisma, ShoppingList, ShoppingListItem, ShoppingListStatus } from '@prisma/client'
import { SortOrder } from '@common/enum'
import { SortFieldQuery, Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'
import { ShoppingListFilterQueryDto } from '../dto'
import { ShoppingListSortField } from '../type'

@Injectable()
export class ShoppingListRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findRecipesForGeneration(
    ids: Uuid[],
    languageIds: Uuid[],
  ): Promise<
    Prisma.RecipeGetPayload<{
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
    }>[]
  > {
    return this.prismaService.recipe.findMany({
      where: {
        id: {
          in: ids,
        },
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

  public prepareShoppingListWhereInput(
    userId: Uuid,
    filter: ShoppingListFilterQueryDto,
  ): Prisma.ShoppingListWhereInput {
    const status = filter.status ?? ShoppingListStatus.ACTIVE

    return {
      userId,
      status,
    }
  }

  public prepareShoppingListSortInput(
    sort?: SortFieldQuery<ShoppingListSortField>,
  ): Prisma.ShoppingListOrderByWithRelationInput {
    const { field, order = SortOrder.Descending } = sort ?? {}

    if (!field) {
      return {
        createdAt: SortOrder.Descending,
      }
    }

    return {
      [field]: order,
    }
  }

  public async getTotalShoppingListsCount(where: Prisma.ShoppingListWhereInput): Promise<number> {
    return this.prismaService.shoppingList.count({ where })
  }

  public async getPaginatedShoppingListItems(
    where: Prisma.ShoppingListWhereInput,
    sort: Prisma.ShoppingListOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<
    Prisma.ShoppingListGetPayload<{
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    }>[]
  > {
    return this.prismaService.shoppingList.findMany({
      where,
      skip,
      take,
      orderBy: sort,
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    })
  }

  public async findShoppingListById(
    id: Uuid,
    languageIds: Uuid[],
  ): Promise<Prisma.ShoppingListGetPayload<{
    include: {
      recipes: {
        include: {
          recipe: {
            include: {
              translations: true
            }
          }
        }
      }
      items: {
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
    return this.prismaService.shoppingList.findUnique({
      where: {
        id,
      },
      include: {
        recipes: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            recipe: {
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
        items: {
          orderBy: {
            createdAt: 'asc',
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
    })
  }

  public async findShoppingListForAccess(
    id: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<Pick<ShoppingList, 'id' | 'userId'> | null> {
    const db = tx ?? this.prismaService

    return db.shoppingList.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
      },
    })
  }

  public async findShoppingListItemForAccess(
    shoppingListId: Uuid,
    itemId: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<Pick<ShoppingListItem, 'id' | 'shoppingListId'> | null> {
    const db = tx ?? this.prismaService

    return db.shoppingListItem.findFirst({
      where: {
        id: itemId,
        shoppingListId,
      },
      select: {
        id: true,
        shoppingListId: true,
      },
    })
  }

  public async createShoppingList(
    data: Prisma.ShoppingListCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ShoppingList> {
    const db = tx ?? this.prismaService

    return db.shoppingList.create({
      data,
    })
  }

  public async updateShoppingListItem(
    id: Uuid,
    data: Prisma.ShoppingListItemUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ShoppingListItem> {
    const db = tx ?? this.prismaService

    return db.shoppingListItem.update({
      where: {
        id,
      },
      data,
    })
  }
}
