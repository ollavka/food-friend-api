import { Injectable } from '@nestjs/common'
import {
  Language,
  MeasurementBaseType,
  MeasurementBaseTypeKey,
  MeasurementUnit,
  Prisma,
  Product,
  ProductTranslation,
} from '@prisma/client'
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
        translations: true,
        measurementBaseType: true,
        measurementUnit: true,
      },
    })

    if (!product) {
      return null
    }

    const translation =
      product.translations.find((item) => item.languageId === language.id) ?? product.translations[0] ?? null

    const { translations, measurementBaseType, measurementUnit, ...productData } = product

    return {
      ...productData,
      measurementBaseType,
      measurementUnit,
      name: translation?.name ?? product.slug,
      description: translation?.description ?? null,
    }
  }

  public async findProductForAccess(
    id: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<Pick<Product, 'id' | 'ownerId' | 'isSystem' | 'measurementBaseTypeId' | 'measurementUnitId'> | null> {
    const db = tx ?? this.prismaService

    return db.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        ownerId: true,
        isSystem: true,
        measurementBaseTypeId: true,
        measurementUnitId: true,
      },
    })
  }

  public async findProductTranslationByLanguage(
    productId: Uuid,
    languageId: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<ProductTranslation | null> {
    const db = tx ?? this.prismaService

    return db.productTranslation.findUnique({
      where: {
        productId_languageId: {
          productId,
          languageId,
        },
      },
    })
  }

  public async findProductForTranslation(
    productId: Uuid,
    sourceLanguageId: Uuid,
    targetLanguageId: Uuid,
  ): Promise<Prisma.ProductGetPayload<{ include: { translations: true } }> | null> {
    return this.prismaService.product.findUnique({
      where: {
        id: productId,
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
    })
  }

  public async upsertProductTranslation(
    productId: Uuid,
    targetLanguageId: Uuid,
    data: { name: string; description?: string | null },
    tx?: Prisma.TransactionClient,
  ): Promise<{ updated: boolean; skippedManual: boolean; translation: ProductTranslation | null }> {
    const db = tx ?? this.prismaService

    const existingTranslation = await db.productTranslation.findUnique({
      where: {
        productId_languageId: {
          productId,
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

    const translation = await db.productTranslation.upsert({
      where: {
        productId_languageId: {
          productId,
          languageId: targetLanguageId,
        },
      },
      create: {
        product: {
          connect: {
            id: productId,
          },
        },
        language: {
          connect: {
            id: targetLanguageId,
          },
        },
        name: data.name,
        description: data.description,
        isAutoTranslated: true,
      },
      update: {
        name: data.name,
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

  public async findMeasurementBaseTypeByKey(
    key: MeasurementBaseTypeKey,
    tx?: Prisma.TransactionClient,
  ): Promise<MeasurementBaseType | null> {
    const db = tx ?? this.prismaService

    return db.measurementBaseType.findUnique({
      where: {
        key,
      },
    })
  }

  public async findMeasurementUnitById(id: Uuid, tx?: Prisma.TransactionClient): Promise<MeasurementUnit | null> {
    const db = tx ?? this.prismaService

    return db.measurementUnit.findUnique({
      where: {
        id,
      },
    })
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
            measurementUnit: true,
          },
        },
      },
      skip,
      take,
      orderBy: sort,
    })

    return productTranslations.map(({ product, name, description }) => ({
      ...product,
      name,
      description,
    }))
  }

  public prepareProductWhereInput(filter: ProductFilterQueryDto, language: Language): Prisma.ProductWhereInput {
    const { measurementBaseType, search, isSystem } = filter ?? {}

    const where: Prisma.ProductWhereInput = {
      ...(measurementBaseType ? { measurementBaseType: { key: measurementBaseType } } : {}),
      ...(isSystem !== undefined ? { isSystem } : {}),
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

  public async createProduct(data: Prisma.ProductCreateInput, tx?: Prisma.TransactionClient): Promise<Product> {
    const db = tx ?? this.prismaService

    return db.product.create({
      data,
    })
  }

  public async updateProduct(
    id: Uuid,
    data: Prisma.ProductUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Product> {
    const db = tx ?? this.prismaService

    return db.product.update({
      where: {
        id,
      },
      data,
    })
  }

  public async removeProduct(id: Uuid, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prismaService

    await db.product.delete({
      where: {
        id,
      },
    })
  }

  public async isProductSlugExists(slug: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prismaService

    const product = await db.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    })

    return !!product
  }
}
