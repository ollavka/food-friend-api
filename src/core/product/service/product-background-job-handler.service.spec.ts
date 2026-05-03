import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobType, LanguageCode } from '@prisma/client'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { ProductBackgroundJobHandlerService } from './product-background-job-handler.service'

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111'
const SOURCE_LANGUAGE_ID = '22222222-2222-4222-8222-222222222222'
const TARGET_LANGUAGE_ID = '33333333-3333-4333-8333-333333333333'
const USER_ID = '44444444-4444-4444-8444-444444444444'

describe('ProductBackgroundJobHandlerService', () => {
  const productRepository: any = {
    findProductForTranslation: jest.fn(),
    upsertProductTranslation: jest.fn(),
  }

  const languageService: any = {
    getLanguageById: jest.fn(),
  }

  const searchService: any = {
    enqueueProductSyncJob: jest.fn(),
  }

  const aiProvider: any = {
    generateStructuredJson: jest.fn(),
  }

  let service: ProductBackgroundJobHandlerService

  beforeEach(() => {
    jest.clearAllMocks()

    service = new ProductBackgroundJobHandlerService(productRepository, languageService, searchService, aiProvider)

    languageService.getLanguageById
      .mockResolvedValueOnce({ id: SOURCE_LANGUAGE_ID, code: LanguageCode.EN })
      .mockResolvedValueOnce({ id: TARGET_LANGUAGE_ID, code: LanguageCode.UK })
  })

  it('should expose supported background job type', () => {
    expect(service.supportedTypes).toEqual([BackgroundJobType.PRODUCT_TRANSLATION])
  })

  it('should translate product and enqueue sync when translation updated', async () => {
    productRepository.findProductForTranslation.mockResolvedValue({
      id: PRODUCT_ID,
      translations: [
        {
          languageId: SOURCE_LANGUAGE_ID,
          name: 'Tomato',
          description: 'Fresh tomato',
        },
      ],
    })

    aiProvider.generateStructuredJson.mockResolvedValue({
      name: 'Томат',
      description: 'Свіжий томат',
    })

    productRepository.upsertProductTranslation.mockResolvedValue({
      updated: true,
      skippedManual: false,
    })

    const result = await service.handle({
      type: BackgroundJobType.PRODUCT_TRANSLATION,
      userId: USER_ID,
      payload: {
        productId: PRODUCT_ID,
        sourceLanguageId: SOURCE_LANGUAGE_ID,
        targetLanguageId: TARGET_LANGUAGE_ID,
      },
    } as never)

    expect(result).toMatchObject({
      type: BackgroundJobType.PRODUCT_TRANSLATION,
      productId: PRODUCT_ID,
      targetLanguageId: TARGET_LANGUAGE_ID,
      updated: true,
      skippedManual: false,
    })
    expect(searchService.enqueueProductSyncJob).toHaveBeenCalledWith(PRODUCT_ID, USER_ID, 'UPSERT')
  })

  it('should skip sync when translation was not updated', async () => {
    productRepository.findProductForTranslation.mockResolvedValue({
      id: PRODUCT_ID,
      translations: [
        {
          languageId: SOURCE_LANGUAGE_ID,
          name: 'Tomato',
          description: null,
        },
      ],
    })

    aiProvider.generateStructuredJson.mockResolvedValue({ name: 'Томат' })
    productRepository.upsertProductTranslation.mockResolvedValue({
      updated: false,
      skippedManual: true,
    })

    const result = await service.handle({
      type: BackgroundJobType.PRODUCT_TRANSLATION,
      userId: USER_ID,
      payload: {
        productId: PRODUCT_ID,
        sourceLanguageId: SOURCE_LANGUAGE_ID,
        targetLanguageId: TARGET_LANGUAGE_ID,
      },
    } as never)

    expect(result.updated).toBe(false)
    expect(searchService.enqueueProductSyncJob).not.toHaveBeenCalled()
  })

  it('should throw non-retryable error on invalid payload', async () => {
    await expect(
      service.handle({
        type: BackgroundJobType.PRODUCT_TRANSLATION,
        payload: { productId: 'invalid' },
      } as never),
    ).rejects.toBeInstanceOf(NonRetryableBackgroundJobError)
  })
})
