import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppBadRequestException, AppEntityNotFoundException } from '@common/exception'
import { ProductService } from './product.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'
const PRODUCT_ID = '33333333-3333-4333-8333-333333333333'

describe('ProductService', () => {
  const productRepository: any = {
    findProductById: jest.fn(),
    prepareProductWhereInput: jest.fn(),
    prepareProductSortInput: jest.fn(),
    getTotalProductsCount: jest.fn(),
    getPaginatedProductItems: jest.fn(),
    findProductForAccess: jest.fn(),
    findProductTranslationByLanguage: jest.fn(),
    updateProduct: jest.fn(),
    removeProduct: jest.fn(),
    findMeasurementUnitById: jest.fn(),
    findMeasurementBaseTypeByKey: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
  }

  const paginationService: any = {
    paginate: jest.fn(),
  }

  const prismaService: any = {
    $transaction: jest.fn(),
  }

  const searchService: any = {
    enqueueProductSyncJob: jest.fn(),
  }

  let service: ProductService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
    })

    prismaService.$transaction.mockImplementation(async (callback: (tx: any) => Promise<unknown>) => callback({}))

    service = new ProductService(productRepository, languageService, paginationService, prismaService, searchService)
  })

  it('should forbid creating system product for non-admin', async () => {
    await expect(
      service.createProduct(
        { id: USER_ID, role: UserRole.REGULAR } as never,
        { name: 'Tomato', measurementBaseType: 'MASS', isSystem: true } as never,
        LanguageCode.EN,
      ),
    ).rejects.toBeInstanceOf(AccessControlAuthorizationException)
  })

  it('should throw not found when product does not exist', async () => {
    productRepository.findProductById.mockResolvedValue(null)

    await expect(service.getProductById(PRODUCT_ID as never, LanguageCode.EN)).rejects.toBeInstanceOf(
      AppEntityNotFoundException,
    )
  })

  it('should return paginated products', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z')
    const item = {
      id: PRODUCT_ID,
      slug: 'tomato',
      name: 'Tomato',
      description: null,
      isSystem: true,
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
      measurementBaseType: { key: 'MASS' },
      measurementUnit: { key: 'G' },
    }

    productRepository.prepareProductWhereInput.mockReturnValue({})
    productRepository.prepareProductSortInput.mockReturnValue(undefined)
    paginationService.paginate.mockResolvedValue({
      items: [item],
      meta: { page: 1, perPage: 10, totalItems: 1, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    })

    const result = await service.getPaginatedProducts({} as never, LanguageCode.EN)

    expect(result.items).toHaveLength(1)
    expect(result.meta.totalItems).toBe(1)
  })

  it('should throw when translation name is missing on update create-translation path', async () => {
    productRepository.findProductForAccess.mockResolvedValue({
      id: PRODUCT_ID,
      ownerId: USER_ID,
      isSystem: false,
      measurementBaseTypeId: 'base-id',
      measurementUnitId: null,
    })
    productRepository.findProductTranslationByLanguage.mockResolvedValue(null)

    await expect(
      service.updateProduct(
        PRODUCT_ID as never,
        { id: USER_ID, role: UserRole.REGULAR } as never,
        { description: 'Desc only' } as never,
        LanguageCode.EN,
      ),
    ).rejects.toBeInstanceOf(AppBadRequestException)
  })

  it('should throw not found on remove when product is missing', async () => {
    productRepository.findProductForAccess.mockResolvedValue(null)

    await expect(
      service.removeProduct(PRODUCT_ID as never, { id: USER_ID, role: UserRole.ADMIN } as never),
    ).rejects.toBeInstanceOf(AppEntityNotFoundException)
  })
})
