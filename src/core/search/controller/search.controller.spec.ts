import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { SearchController } from './search.controller'

describe('SearchController', () => {
  const searchService: any = {
    searchProducts: jest.fn(),
    searchRecipes: jest.fn(),
    createReindexJobs: jest.fn(),
  }

  let controller: SearchController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new SearchController(searchService)
  })

  it('should delegate products and recipes search', async () => {
    searchService.searchProducts.mockResolvedValue({ items: [] })
    searchService.searchRecipes.mockResolvedValue({ items: [] })

    await controller.searchProducts('EN' as never, {} as never)
    await controller.searchRecipes('EN' as never, {} as never)

    expect(searchService.searchProducts).toHaveBeenCalledWith({}, 'EN')
    expect(searchService.searchRecipes).toHaveBeenCalledWith({}, 'EN')
  })

  it('should delegate reindex operation', async () => {
    const user = { id: 'user-1' }
    searchService.createReindexJobs.mockResolvedValue([{ id: 'job-1' }])

    const result = await controller.reindexSearch(user as never, { entities: ['PRODUCTS'] } as never)

    expect(result).toEqual([{ id: 'job-1' }])
    expect(searchService.createReindexJobs).toHaveBeenCalledWith(user, { entities: ['PRODUCTS'] })
  })
})
