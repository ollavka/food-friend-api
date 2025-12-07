import { Injectable } from '@nestjs/common'
import { Language, Prisma } from '@prisma/client'
import { SortOrder } from '@common/enum'
import { SortFieldQuery, Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'
import { ProductFilterQueryDto } from '../dto'
import { ProductSortField, ProductWithTranslation } from '../type'

@Injectable()
export class ProductRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findProductById(id: Uuid, language: Language): Promise<ProductWithTranslation | null> {
    const product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
      include: {
        translations: {
          where: {
            languageId: language.id,
          },
        },
        measurementBaseType: true,
      },
    })

    if (!product) {
      return null
    }

    const { translations, measurementBaseType, ...productData } = product

    return {
      ...productData,
      measurementBaseType,
      name: translations[0].name,
    }
  }

  public async getTotalProductsCount(where: Prisma.ProductWhereInput): Promise<number> {
    return this.prismaService.product.count({ where })
  }

  public async getPaginatedProductItems(
    where: Prisma.ProductWhereInput,
    sort: Prisma.ProductTranslationOrderByWithRelationInput,
    skip: number,
    take: number,
    language: Language,
  ): Promise<ProductWithTranslation[]> {
    const productTranslations = await this.prismaService.productTranslation.findMany({
      where: {
        languageId: language.id,
        product: where,
      },
      include: {
        product: {
          include: {
            measurementBaseType: true,
          },
        },
      },
      skip,
      take,
      orderBy: sort,
    })

    return productTranslations.map(({ product, name }) => ({
      ...product,
      name,
    }))
  }

  public prepareProductWhereInput(filter: ProductFilterQueryDto, language: Language): Prisma.ProductWhereInput {
    const { measurementBaseType, search } = filter ?? {}

    const where: Prisma.ProductWhereInput = {
      ...(measurementBaseType ? { measurementBaseType: { key: measurementBaseType } } : {}),
      // TODO: change it later with meilisearch
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
                    name: {
                      mode: 'insensitive',
                      contains: search,
                    },
                    languageId: language.id,
                  },
                },
              },
            ],
          }
        : {}),
    }

    return where
  }

  public prepareProductSortInput(
    sort?: SortFieldQuery<ProductSortField>,
  ): Prisma.ProductTranslationOrderByWithRelationInput | undefined {
    const { field, order = SortOrder.Ascending } = sort ?? {}

    if (!field) {
      return
    }

    if (field === 'name') {
      return {
        name: order,
      }
    }

    return {
      product: {
        [field]: order,
      },
    }
  }
}
