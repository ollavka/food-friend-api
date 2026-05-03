import { Inject, Injectable } from '@nestjs/common'
import { BackgroundJob, BackgroundJobType, LanguageCode, Prisma } from '@prisma/client'
import { Uuid } from '@common/type'
import {
  getLanguageLabelByCode,
  isRecord,
  isUuid,
  normalizeOptionalString,
  normalizeRequiredString,
} from '@common/util'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { LanguageService } from '@core/language'
import { SearchService } from '@core/search'
import {
  AI_PROVIDER_TOKEN,
  AiProvider,
  GenerateStructuredJsonContentPart,
  GenerateStructuredJsonInput,
} from '@infrastructure/ai'
import { ProductRepository } from '../repository'

@Injectable()
export class ProductBackgroundJobHandlerService {
  public readonly supportedTypes = [BackgroundJobType.PRODUCT_TRANSLATION]

  public constructor(
    private readonly productRepository: ProductRepository,
    private readonly languageService: LanguageService,
    private readonly searchService: SearchService,
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AiProvider,
  ) {}

  public async handle(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    return this.handleProductTranslationJob(backgroundJob)
  }

  private async handleProductTranslationJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    const payload = this.parseTranslationPayload(backgroundJob.payload)

    const product = await this.productRepository.findProductForTranslation(
      payload.productId,
      payload.sourceLanguageId,
      payload.targetLanguageId,
    )

    if (!product) {
      throw new NonRetryableBackgroundJobError('Product for translation not found.', {
        productId: payload.productId,
      })
    }

    const sourceTranslation =
      product.translations.find((translation) => translation.languageId === payload.sourceLanguageId) ??
      product.translations[0] ??
      null

    if (!sourceTranslation) {
      throw new NonRetryableBackgroundJobError('Source product translation does not exist.', {
        productId: payload.productId,
        sourceLanguageId: payload.sourceLanguageId,
      })
    }

    const [sourceLanguage, targetLanguage] = await Promise.all([
      this.languageService.getLanguageById(payload.sourceLanguageId),
      this.languageService.getLanguageById(payload.targetLanguageId),
    ])

    if (!sourceLanguage || !targetLanguage) {
      throw new NonRetryableBackgroundJobError('Source or target language does not exist.', {
        sourceLanguageId: payload.sourceLanguageId,
        targetLanguageId: payload.targetLanguageId,
      })
    }

    const translated = await this.translateProductFields({
      sourceLanguageCode: sourceLanguage.code,
      targetLanguageCode: targetLanguage.code,
      name: sourceTranslation.name,
      description: sourceTranslation.description,
    })

    const upsertResult = await this.productRepository.upsertProductTranslation(
      payload.productId,
      payload.targetLanguageId,
      {
        name: translated.name,
        description: translated.description ?? null,
      },
    )

    if (upsertResult.updated) {
      await this.searchService.enqueueProductSyncJob(payload.productId, backgroundJob.userId, 'UPSERT')
    }

    return {
      type: BackgroundJobType.PRODUCT_TRANSLATION,
      productId: payload.productId,
      targetLanguageId: payload.targetLanguageId,
      updated: upsertResult.updated,
      skippedManual: upsertResult.skippedManual,
    }
  }

  private async translateProductFields(input: {
    sourceLanguageCode: LanguageCode
    targetLanguageCode: LanguageCode
    name: string
    description?: string | null
  }): Promise<{ name: string; description?: string | null }> {
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string' },
        description: { type: ['string', 'null'] },
      },
    }

    const userContent: GenerateStructuredJsonContentPart[] = [
      {
        type: 'text',
        text: [
          `Translate product fields from ${getLanguageLabelByCode(input.sourceLanguageCode)} to ${getLanguageLabelByCode(input.targetLanguageCode)}.`,
          'Keep product meaning unchanged and avoid adding extra words.',
          `Name: ${input.name}`,
          `Description: ${input.description ?? ''}`,
        ].join('\n'),
      },
    ]

    const request: GenerateStructuredJsonInput = {
      schemaName: 'product_translation',
      schema,
      systemPrompt:
        'You are a professional translator for a food application. Return only a valid JSON object that matches the provided schema.',
      userContent,
    }

    const response = await this.aiProvider.generateStructuredJson(request)

    const name = normalizeRequiredString(
      response.name,
      'name',
      (message) => new NonRetryableBackgroundJobError(message),
    )
    const description = normalizeOptionalString(response.description)

    return {
      name,
      description,
    }
  }

  private parseTranslationPayload(payload: Prisma.JsonValue): {
    productId: Uuid
    sourceLanguageId: Uuid
    targetLanguageId: Uuid
  } {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Background job payload must be object.', {
        type: BackgroundJobType.PRODUCT_TRANSLATION,
      })
    }

    const rawProductId = payload.productId
    const rawSourceLanguageId = payload.sourceLanguageId
    const rawTargetLanguageId = payload.targetLanguageId

    if (!isUuid(rawProductId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "productId" is invalid.', {
        productId: rawProductId,
      })
    }

    if (!isUuid(rawSourceLanguageId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "sourceLanguageId" is invalid.', {
        sourceLanguageId: rawSourceLanguageId,
      })
    }

    if (!isUuid(rawTargetLanguageId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "targetLanguageId" is invalid.', {
        targetLanguageId: rawTargetLanguageId,
      })
    }

    return {
      productId: rawProductId,
      sourceLanguageId: rawSourceLanguageId,
      targetLanguageId: rawTargetLanguageId,
    }
  }
}
