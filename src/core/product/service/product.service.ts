import { Injectable } from '@nestjs/common'
import { BackgroundJobType, Language, LanguageCode, Prisma, User, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppBadRequestException, AppEntityNotFoundException } from '@common/exception'
import { PaginatedResult, Uuid } from '@common/type'
import { hashToUuid, randomHash, slugifyText, toLowerCase } from '@common/util'
import { LanguageService } from '@core/language'
import { SearchService } from '@core/search'
import { PrismaService } from '@infrastructure/database'
import { PaginationService } from '@infrastructure/pagination'
import { PaginatedProductsApiModel, ProductApiModel } from '../api-model'
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from '../dto'
import { ProductRepository } from '../repository'
import { ProductWithTranslation } from '../type'

@Injectable()
export class ProductService {
  public constructor(
    private readonly productRepository: ProductRepository,
    private readonly languageService: LanguageService,
    private readonly paginationService: PaginationService,
    private readonly prismaService: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  public async getProductById(id: Uuid, languageCode: LanguageCode): Promise<ProductApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const product = await this.productRepository.findProductById(id, language)

    if (!product) {
      throw AppEntityNotFoundException.byId('Product', id)
    }

    return ProductApiModel.from(product)
  }

  public async getPaginatedProducts(
    query: ProductQueryDto,
    languageCode: LanguageCode,
  ): Promise<PaginatedProductsApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const paginatedProducts = await this.findPaginatedProducts(query, language)
    const productsModel = ProductApiModel.fromList(paginatedProducts.items)
    return {
      items: productsModel,
      meta: paginatedProducts.meta,
    }
  }

  public async createProduct(user: User, dto: CreateProductDto, languageCode: LanguageCode): Promise<ProductApiModel> {
    if (dto.isSystem === true && user.role !== UserRole.ADMIN) {
      throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
    }

    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const { isSystem, measurementBaseTypeId, measurementUnitId } = await this.resolveProductRelations(dto)

    const createdProductId = await this.prismaService.$transaction(async (tx) => {
      const slug = await this.generateUniqueSlug(dto.name, tx)

      const product = await this.productRepository.createProduct(
        {
          slug,
          isSystem,
          imageUrl: dto.imageUrl,
          imageKey: dto.imageKey,
          measurementBaseType: {
            connect: {
              id: measurementBaseTypeId,
            },
          },
          ...(measurementUnitId
            ? {
                measurementUnit: {
                  connect: {
                    id: measurementUnitId,
                  },
                },
              }
            : {}),
          sourceLanguage: {
            connect: {
              id: language.id,
            },
          },
          ...(!isSystem
            ? {
                owner: {
                  connect: {
                    id: user.id,
                  },
                },
              }
            : {}),
          translations: {
            create: {
              language: {
                connect: {
                  id: language.id,
                },
              },
              name: dto.name,
              description: dto.description,
              isAutoTranslated: false,
            },
          },
        },
        tx,
      )

      await this.createProductTranslationJobs(product.id, language.id, user.id, tx)
      await this.searchService.enqueueProductSyncJob(product.id, user.id, 'UPSERT', tx)

      return product.id
    })

    return this.getProductById(createdProductId, languageCode)
  }

  public async updateProduct(
    id: Uuid,
    user: User,
    dto: UpdateProductDto,
    languageCode: LanguageCode,
  ): Promise<ProductApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)

    await this.prismaService.$transaction(async (tx) => {
      const productForAccess = await this.productRepository.findProductForAccess(id, tx)

      if (!productForAccess) {
        throw AppEntityNotFoundException.byId('Product', id)
      }

      this.enforceProductManageAccess(productForAccess, user)

      const relationData = await this.resolveProductRelations(dto, {
        currentMeasurementBaseTypeId: productForAccess.measurementBaseTypeId,
        currentMeasurementUnitId: productForAccess.measurementUnitId,
        tx,
      })

      const updateData: Prisma.ProductUpdateInput = {
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.imageKey !== undefined ? { imageKey: dto.imageKey } : {}),
        ...(dto.measurementBaseType !== undefined
          ? {
              measurementBaseType: {
                connect: {
                  id: relationData.measurementBaseTypeId,
                },
              },
            }
          : {}),
        ...(dto.measurementUnitId !== undefined
          ? {
              measurementUnit: {
                connect: {
                  id: relationData.measurementUnitId,
                },
              },
            }
          : {}),
      }

      if (dto.name !== undefined || dto.description !== undefined) {
        const currentTranslation = await this.productRepository.findProductTranslationByLanguage(id, language.id, tx)

        if (!currentTranslation && dto.name === undefined) {
          throw new AppBadRequestException(
            'product.translation-name-required',
            'Product name is required to create translation for the selected language.',
          )
        }

        updateData.translations = {
          upsert: {
            where: {
              productId_languageId: {
                productId: id,
                languageId: language.id,
              },
            },
            create: {
              language: {
                connect: {
                  id: language.id,
                },
              },
              name: dto.name ?? currentTranslation!.name,
              description: dto.description,
              isAutoTranslated: false,
            },
            update: {
              ...(dto.name !== undefined ? { name: dto.name } : {}),
              ...(dto.description !== undefined ? { description: dto.description } : {}),
              isAutoTranslated: false,
            },
          },
        }
      }

      await this.productRepository.updateProduct(id, updateData, tx)

      await this.createProductTranslationJobs(id, language.id, user.id, tx)
      await this.searchService.enqueueProductSyncJob(id, user.id, 'UPSERT', tx)
    })

    return this.getProductById(id, languageCode)
  }

  public async removeProduct(id: Uuid, user: User): Promise<null> {
    const product = await this.productRepository.findProductForAccess(id)

    if (!product) {
      throw AppEntityNotFoundException.byId('Product', id)
    }

    this.enforceProductManageAccess(product, user)

    await this.prismaService.$transaction(async (tx) => {
      await this.productRepository.removeProduct(id, tx)
      await this.searchService.enqueueProductSyncJob(id, user.id, 'DELETE', tx)
    })

    return null
  }

  private async findPaginatedProducts(
    query: ProductQueryDto,
    language: Language,
  ): Promise<PaginatedResult<ProductWithTranslation>> {
    const { filter, pagination } = query
    const where = this.productRepository.prepareProductWhereInput(filter ?? {}, language)
    const sort = this.productRepository.prepareProductSortInput(query.sort)

    const paginatedProducts = await this.paginationService.paginate<ProductWithTranslation>({
      ...(pagination ?? {}),
      countFn: () => this.productRepository.getTotalProductsCount(where),
      itemsFn: (skip, take) => this.productRepository.getPaginatedProductItems(where, sort ?? {}, skip, take, language),
    })

    return paginatedProducts
  }

  private async resolveProductRelations(
    dto: Partial<CreateProductDto>,
    options?: {
      currentMeasurementBaseTypeId?: Uuid | null
      currentMeasurementUnitId?: Uuid | null
      tx?: Prisma.TransactionClient
    },
  ): Promise<{ isSystem: boolean; measurementBaseTypeId: Uuid; measurementUnitId?: Uuid }> {
    const { currentMeasurementBaseTypeId, currentMeasurementUnitId, tx } = options ?? {}
    const isSystem = dto.isSystem ?? false

    let measurementBaseTypeId = currentMeasurementBaseTypeId ?? null

    if (dto.measurementBaseType) {
      const measurementBaseType = await this.productRepository.findMeasurementBaseTypeByKey(dto.measurementBaseType, tx)

      if (!measurementBaseType) {
        throw AppEntityNotFoundException.by('MeasurementBaseType', { key: dto.measurementBaseType })
      }

      measurementBaseTypeId = measurementBaseType.id
    }

    if (!measurementBaseTypeId) {
      throw new AppBadRequestException(
        'product.measurement-base-type-required',
        'Product measurement base type is required.',
      )
    }

    const measurementUnitId = dto.measurementUnitId
      ? <Uuid>hashToUuid(dto.measurementUnitId)
      : (currentMeasurementUnitId ?? undefined)

    if (!measurementUnitId) {
      return {
        isSystem,
        measurementBaseTypeId,
      }
    }

    const measurementUnit = await this.productRepository.findMeasurementUnitById(measurementUnitId, tx)

    if (!measurementUnit) {
      throw AppEntityNotFoundException.byId('MeasurementUnit', measurementUnitId)
    }

    if (measurementUnit.baseTypeId !== measurementBaseTypeId) {
      throw new AppBadRequestException(
        'product.measurement-unit-mismatch',
        'Product measurement unit is not compatible with selected measurement base type.',
        {
          measurementUnitId,
          measurementBaseTypeId,
        },
      )
    }

    return {
      isSystem,
      measurementBaseTypeId,
      measurementUnitId,
    }
  }

  private enforceProductManageAccess(product: { ownerId: Uuid | null; isSystem: boolean }, user: User): void {
    if (user.role === UserRole.ADMIN) {
      return
    }

    if (!product.isSystem && product.ownerId === user.id) {
      return
    }

    throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
  }

  private async createProductTranslationJobs(
    productId: Uuid,
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
        type: BackgroundJobType.PRODUCT_TRANSLATION,
        status: 'PENDING',
        userId,
        dedupKey: `product-translation:${productId}:${targetLanguage.id}:${randomHash()}`,
        payload: {
          productId,
          sourceLanguageId,
          targetLanguageId: targetLanguage.id,
        },
      })),
    })
  }

  private async generateUniqueSlug(title: string, tx: Prisma.TransactionClient): Promise<string> {
    const baseSlug = slugifyText(title) || `product-${toLowerCase(randomHash()).slice(0, 8)}`

    for (let attempt = 0; attempt < 10; attempt++) {
      const suffix = attempt > 0 ? `-${toLowerCase(randomHash()).slice(0, 6)}` : ''
      const slug = `${baseSlug}${suffix}`

      const slugExists = await this.productRepository.isProductSlugExists(slug, tx)

      if (!slugExists) {
        return slug
      }
    }

    return `${baseSlug}-${toLowerCase(randomHash()).slice(0, 8)}`
  }
}
