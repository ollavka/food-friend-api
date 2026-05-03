import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AppInternalException } from '@common/exception'
import { MeilisearchService } from './meilisearch.service'

type FetchMock = jest.MockedFunction<typeof fetch>

function createJsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('MeilisearchService', () => {
  let service: MeilisearchService
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = jest.fn<typeof fetch>() as FetchMock
    global.fetch = fetchMock

    service = new MeilisearchService({
      host: 'http://localhost:7700/',
      apiKey: 'secret',
      productsIndexUid: 'products',
      recipesIndexUid: 'recipes',
    } as never)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create and configure index once and skip repeated ensureIndex call', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)

      if (url.endsWith('/indexes')) {
        return createJsonResponse({ taskUid: 1 }, 202)
      }

      if (url.endsWith('/indexes/products/settings')) {
        return createJsonResponse({ taskUid: 2 }, 202)
      }

      if (url.endsWith('/tasks/1') || url.endsWith('/tasks/2')) {
        return createJsonResponse({ status: 'succeeded' })
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    await service.ensureIndex('products', {
      searchableAttributes: ['name'],
      filterableAttributes: ['isSystem'],
      sortableAttributes: ['createdAtTs'],
    })

    await service.ensureIndex('products', {
      searchableAttributes: ['name'],
    })

    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('should normalize search response fields', async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse({
        hits: [{ id: '1' }],
        estimatedTotalHits: 10,
      }),
    )

    const result = await service.search('products', 'potato', {
      page: 1,
      hitsPerPage: 10,
    })

    expect(result.hits).toEqual([{ id: '1' }])
    expect(result.estimatedTotalHits).toBe(10)
    expect(result.totalHits).toBeUndefined()
  })

  it('should skip deleteDocuments call for empty ids', async () => {
    await service.deleteDocuments('products', [])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('should wrap provider request error for failed search call', async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse(
        {
          code: 'invalid_search_filter',
          message: 'Invalid filter',
        },
        400,
      ),
    )

    await expect(service.search('products', 'potato')).rejects.toThrow(AppInternalException)
  })

  it('should throw provider error when task ends with failed status', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)

      if (url.endsWith('/indexes/products/documents')) {
        return createJsonResponse({ taskUid: 8 }, 202)
      }

      if (url.endsWith('/tasks/8')) {
        return createJsonResponse({
          status: 'failed',
          error: {
            code: 'invalid_document',
            message: 'Document is invalid',
          },
        })
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    await expect(service.upsertDocuments('products', [{ id: '1' }])).rejects.toThrow(AppInternalException)
  })
})
