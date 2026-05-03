import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { SortOrder } from '@common/enum'
import { ProductRepository } from './product.repository'

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111'
const LANGUAGE_ID = '22222222-2222-4222-8222-222222222222'

describe('ProductRepository', () => {
  const prismaService: any = {
    product: {
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    productTranslation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    measurementBaseType: {
      findUnique: jest.fn(),
    },
    measurementUnit: {
      findUnique: jest.fn(),
    },
  }

  let repository: ProductRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new ProductRepository(prismaService)
  })

  it('should return null when product is not found by id', async () => {
    prismaService.product.findUnique.mockResolvedValue(null)

    const result = await repository.findProductById(PRODUCT_ID as never, { id: LANGUAGE_ID } as never)

    expect(result).toBeNull()
  })

  it('should map product and translation when product exists', async () => {
    prismaService.product.findUnique.mockResolvedValue({
      id: PRODUCT_ID,
      slug: 'potato',
      translations: [{ languageId: LANGUAGE_ID, name: 'Potato', description: 'Fresh' }],
      measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
      measurementUnit: { key: 'G' },
    })

    const result = await repository.findProductById(PRODUCT_ID as never, { id: LANGUAGE_ID } as never)

    expect(result).toEqual({
      id: PRODUCT_ID,
      slug: 'potato',
      measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
      measurementUnit: { key: 'G' },
      name: 'Potato',
      description: 'Fresh',
    })
  })

  it('should find product for access with select projection', async () => {
    prismaService.product.findUnique.mockResolvedValue({ id: PRODUCT_ID })

    await repository.findProductForAccess(PRODUCT_ID as never)

    expect(prismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      select: {
        id: true,
        ownerId: true,
        isSystem: true,
        measurementBaseTypeId: true,
        measurementUnitId: true,
      },
    })
  })

  it('should find product translation by language', async () => {
    prismaService.productTranslation.findUnique.mockResolvedValue({ id: 'translation-id' })

    await repository.findProductTranslationByLanguage(PRODUCT_ID as never, LANGUAGE_ID as never)

    expect(prismaService.productTranslation.findUnique).toHaveBeenCalledWith({
      where: {
        productId_languageId: {
          productId: PRODUCT_ID,
          languageId: LANGUAGE_ID,
        },
      },
    })
  })

  it('should find product for translation by source and target languages', async () => {
    await repository.findProductForTranslation(
      PRODUCT_ID as never,
      'source-lang-id' as never,
      'target-lang-id' as never,
    )

    expect(prismaService.product.findUnique).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      include: {
        translations: {
          where: {
            languageId: {
              in: ['source-lang-id', 'target-lang-id'],
            },
          },
        },
      },
    })
  })

  it('should skip auto-update for manual product translation', async () => {
    prismaService.productTranslation.findUnique.mockResolvedValue({
      id: 'translation-id',
      isAutoTranslated: false,
    })

    const result = await repository.upsertProductTranslation(PRODUCT_ID as never, LANGUAGE_ID as never, {
      name: 'Potato',
    })

    expect(result).toEqual({
      updated: false,
      skippedManual: true,
      translation: {
        id: 'translation-id',
        isAutoTranslated: false,
      },
    })
    expect(prismaService.productTranslation.upsert).not.toHaveBeenCalled()
  })

  it('should upsert auto-translated product translation', async () => {
    prismaService.productTranslation.findUnique.mockResolvedValue({
      id: 'translation-id',
      isAutoTranslated: true,
    })
    prismaService.productTranslation.upsert.mockResolvedValue({ id: 'translation-id' })

    const result = await repository.upsertProductTranslation(PRODUCT_ID as never, LANGUAGE_ID as never, {
      name: 'Potato',
      description: 'Fresh',
    })

    expect(prismaService.productTranslation.upsert).toHaveBeenCalled()
    expect(result).toEqual({
      updated: true,
      skippedManual: false,
      translation: { id: 'translation-id' },
    })
  })

  it('should query measurement base type and measurement unit', async () => {
    await repository.findMeasurementBaseTypeByKey(MeasurementBaseTypeKey.MASS)
    await repository.findMeasurementUnitById('unit-id' as never)

    expect(prismaService.measurementBaseType.findUnique).toHaveBeenCalledWith({
      where: { key: MeasurementBaseTypeKey.MASS },
    })
    expect(prismaService.measurementUnit.findUnique).toHaveBeenCalledWith({
      where: { id: 'unit-id' },
    })
  })

  it('should count and paginate product items', async () => {
    prismaService.product.count.mockResolvedValue(7)
    prismaService.productTranslation.findMany.mockResolvedValue([
      {
        name: 'Potato',
        description: 'Fresh',
        product: {
          id: PRODUCT_ID,
          slug: 'potato',
          measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
          measurementUnit: { key: 'G' },
        },
      },
    ])

    const count = await repository.getTotalProductsCount({ isSystem: true })
    const items = await repository.getPaginatedProductItems({ isSystem: true }, { name: SortOrder.Ascending }, 0, 10, {
      id: LANGUAGE_ID,
    } as never)

    expect(count).toBe(7)
    expect(items).toEqual([
      {
        id: PRODUCT_ID,
        slug: 'potato',
        measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
        measurementUnit: { key: 'G' },
        name: 'Potato',
        description: 'Fresh',
      },
    ])
  })

  it('should build where input with search and filters', () => {
    const where = repository.prepareProductWhereInput(
      {
        measurementBaseType: MeasurementBaseTypeKey.MASS,
        search: 'pot',
        isSystem: true,
      } as never,
      { id: LANGUAGE_ID } as never,
    )

    expect(where).toEqual({
      measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
      isSystem: true,
      OR: [
        {
          slug: {
            contains: 'pot',
            mode: 'insensitive',
          },
        },
        {
          translations: {
            some: {
              name: {
                mode: 'insensitive',
                contains: 'pot',
              },
              languageId: LANGUAGE_ID,
            },
          },
        },
      ],
    })
  })

  it('should build sort input for name and product fields', () => {
    expect(repository.prepareProductSortInput()).toBeUndefined()
    expect(repository.prepareProductSortInput({ field: 'name', order: SortOrder.Descending } as never)).toEqual({
      name: SortOrder.Descending,
    })
    expect(repository.prepareProductSortInput({ field: 'createdAt', order: SortOrder.Ascending } as never)).toEqual({
      product: {
        createdAt: SortOrder.Ascending,
      },
    })
  })

  it('should create, update and remove product', async () => {
    await repository.createProduct({ slug: 'potato' } as never)
    await repository.updateProduct(PRODUCT_ID as never, { slug: 'new-potato' } as never)
    await repository.removeProduct(PRODUCT_ID as never)

    expect(prismaService.product.create).toHaveBeenCalledWith({ data: { slug: 'potato' } })
    expect(prismaService.product.update).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: { slug: 'new-potato' },
    })
    expect(prismaService.product.delete).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
    })
  })

  it('should check product slug existence', async () => {
    prismaService.product.findUnique.mockResolvedValueOnce({ id: PRODUCT_ID }).mockResolvedValueOnce(null)

    await expect(repository.isProductSlugExists('potato')).resolves.toBe(true)
    await expect(repository.isProductSlugExists('unknown')).resolves.toBe(false)
  })
})
