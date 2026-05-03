import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { SearchRepository } from './search.repository'

describe('SearchRepository', () => {
  const prismaService: any = {
    language: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    recipe: {
      findMany: jest.fn(),
    },
  }

  let repository: SearchRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new SearchRepository(prismaService)
  })

  it('should find all language codes', async () => {
    prismaService.language.findMany.mockResolvedValue([{ code: 'EN' }, { code: 'UK' }])

    const codes = await repository.findAllLanguageCodes()

    expect(codes).toEqual(['EN', 'UK'])
  })

  it('should query products for indexing with and without specific ids', async () => {
    prismaService.product.findMany.mockResolvedValue([])

    await repository.findProductsForIndexing(['product-id'] as never)
    await repository.findProductsForIndexing()

    expect(prismaService.product.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          id: {
            in: ['product-id'],
          },
        },
      }),
    )
    expect(prismaService.product.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: undefined,
      }),
    )
  })

  it('should query recipes for indexing with and without specific ids', async () => {
    prismaService.recipe.findMany.mockResolvedValue([])

    await repository.findRecipesForIndexing(['recipe-id'] as never)
    await repository.findRecipesForIndexing()

    expect(prismaService.recipe.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          id: {
            in: ['recipe-id'],
          },
        },
      }),
    )
    expect(prismaService.recipe.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: undefined,
      }),
    )
  })
})
