import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { LanguageCode, MeasurementBaseTypeKey, MeasurementUnitKey } from '@prisma/client'
import { SortOrder } from '@common/enum'
import { LanguageService } from '@core/language/service'
import { ProductController } from '@core/product/controller'
import { ProductRepository } from '@core/product/repository'
import { ProductService } from '@core/product/service'
import { SearchService } from '@core/search/service'
import { PrismaService } from '@infrastructure/database'
import { PaginationService } from '@infrastructure/pagination'

const LANGUAGE_ID = '11111111-1111-4111-8111-111111111111'
const PRODUCT_ID = '22222222-2222-4222-8222-222222222222'
const BASE_TYPE_ID = '33333333-3333-4333-8333-333333333333'
const UNIT_ID = '44444444-4444-4444-8444-444444444444'

describe('Product read integration', () => {
  let testingModule: TestingModule
  let productController: ProductController

  const languageServiceMock = {
    getLanguageOrDefault: jest.fn(async () => ({
      id: LANGUAGE_ID,
      code: LanguageCode.EN,
    })),
  }

  const paginationServiceMock = {
    paginate: jest.fn(async ({ countFn, itemsFn }: { countFn: () => Promise<number>; itemsFn: any }) => {
      const totalItems = await countFn()
      const items = await itemsFn(0, 10)
      return {
        items,
        meta: {
          totalItems,
          page: 1,
          perPage: 10,
          pageCount: totalItems > 0 ? 1 : 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    }),
  }

  const searchServiceMock = {
    enqueueProductSyncJob: jest.fn(async () => undefined),
  }

  const prismaServiceMock: any = {
    product: {
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    productTranslation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    measurementBaseType: {
      findUnique: jest.fn(),
    },
    measurementUnit: {
      findUnique: jest.fn(),
    },
    backgroundJob: {
      createMany: jest.fn(),
    },
    language: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => callback(prismaServiceMock)),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    prismaServiceMock.product.count.mockResolvedValue(1)
    prismaServiceMock.productTranslation.findMany.mockResolvedValue([
      {
        name: 'Potato',
        description: 'Fresh potato',
        product: {
          id: PRODUCT_ID,
          slug: 'potato',
          isSystem: true,
          imageKey: null,
          imageUrl: null,
          ownerId: null,
          sourceLanguageId: LANGUAGE_ID,
          measurementBaseTypeId: BASE_TYPE_ID,
          measurementUnitId: UNIT_ID,
          createdAt: new Date('2026-01-01T10:00:00.000Z'),
          updatedAt: new Date('2026-01-02T10:00:00.000Z'),
          measurementBaseType: {
            id: BASE_TYPE_ID,
            key: MeasurementBaseTypeKey.MASS,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
          measurementUnit: {
            id: UNIT_ID,
            key: MeasurementUnitKey.KG,
            baseTypeId: BASE_TYPE_ID,
            ratioToBaseConvert: 1000,
            isBaseUnit: false,
            isUserSelectable: true,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
      },
    ])

    prismaServiceMock.product.findUnique.mockResolvedValue({
      id: PRODUCT_ID,
      slug: 'potato',
      isSystem: true,
      imageKey: null,
      imageUrl: null,
      ownerId: null,
      sourceLanguageId: LANGUAGE_ID,
      measurementBaseTypeId: BASE_TYPE_ID,
      measurementUnitId: UNIT_ID,
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
      updatedAt: new Date('2026-01-02T10:00:00.000Z'),
      measurementBaseType: {
        id: BASE_TYPE_ID,
        key: MeasurementBaseTypeKey.MASS,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      measurementUnit: {
        id: UNIT_ID,
        key: MeasurementUnitKey.KG,
        baseTypeId: BASE_TYPE_ID,
        ratioToBaseConvert: 1000,
        isBaseUnit: false,
        isUserSelectable: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      translations: [
        {
          id: '55555555-5555-4555-8555-555555555555',
          productId: PRODUCT_ID,
          languageId: LANGUAGE_ID,
          name: 'Potato',
          description: 'Fresh potato',
          isAutoTranslated: false,
          createdAt: new Date('2026-01-01T10:00:00.000Z'),
          updatedAt: new Date('2026-01-01T10:00:00.000Z'),
        },
      ],
    })

    testingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        ProductRepository,
        {
          provide: LanguageService,
          useValue: languageServiceMock,
        },
        {
          provide: PaginationService,
          useValue: paginationServiceMock,
        },
        {
          provide: SearchService,
          useValue: searchServiceMock,
        },
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    productController = testingModule.get(ProductController)
  })

  it('should return paginated products through controller-service-repository chain', async () => {
    const result = await productController.getProductList(LanguageCode.EN, {
      filter: {
        search: 'pot',
        isSystem: true,
      },
      sort: {
        field: 'name',
        order: SortOrder.Ascending,
      },
      pagination: {
        page: 1,
        perPage: 10,
      },
    } as never)

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: PRODUCT_ID,
        slug: 'potato',
        name: 'Potato',
        measurementBaseType: MeasurementBaseTypeKey.MASS,
        measurementUnit: MeasurementUnitKey.KG,
        isSystem: true,
      }),
    )
    expect(result.meta.totalItems).toBe(1)
    expect(prismaServiceMock.productTranslation.findMany).toHaveBeenCalledTimes(1)
    expect(prismaServiceMock.product.count).toHaveBeenCalledTimes(1)
  })

  it('should return product details through controller-service-repository chain', async () => {
    const result = await productController.getProductById(PRODUCT_ID as never, LanguageCode.EN)

    expect(result).toEqual(
      expect.objectContaining({
        id: PRODUCT_ID,
        slug: 'potato',
        name: 'Potato',
        description: 'Fresh potato',
        measurementBaseType: MeasurementBaseTypeKey.MASS,
        measurementUnit: MeasurementUnitKey.KG,
      }),
    )
    expect(prismaServiceMock.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: PRODUCT_ID,
        },
      }),
    )
  })
})
