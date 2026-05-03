import { describe, expect, it } from '@jest/globals'
import { PaginationService } from './pagination.service'

describe('PaginationService', () => {
  const service = new PaginationService()

  it('should paginate items and build metadata', async () => {
    const result = await service.paginate({
      page: 2,
      limit: 3,
      countFn: async () => 8,
      itemsFn: async (skip, take) => {
        expect(skip).toBe(3)
        expect(take).toBe(3)
        return ['a', 'b', 'c']
      },
    })

    expect(result.items).toEqual(['a', 'b', 'c'])
    expect(result.meta).toEqual({
      totalItems: 8,
      page: 2,
      perPage: 3,
      pageCount: 3,
      hasNextPage: true,
      hasPrevPage: true,
    })
  })

  it('should keep pageCount at least one', async () => {
    const result = await service.paginate({
      countFn: async () => 0,
      itemsFn: async () => [],
    })

    expect(result.meta.pageCount).toBe(1)
    expect(result.meta.hasNextPage).toBe(false)
    expect(result.meta.hasPrevPage).toBe(false)
  })
})
