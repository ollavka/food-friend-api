import { Inject, Injectable } from '@nestjs/common'
import { getConfigToken } from '@nestjs/config'
import OpenAI from 'openai'
import { AppInternalException } from '@common/exception'
import { getLanguageLabelByCode, isRecord, normalizeRequiredString } from '@common/util'
import { OPEN_AI_CLIENT_TOKEN, OPEN_AI_ENV_CONFIG_KEY, OpenAiEnvConfig } from '../config'
import {
  AiProvider,
  GenerateImageInput,
  GenerateImageOutput,
  GenerateStructuredJsonInput,
  TranslateTextInput,
  TranslateTextOutput,
} from '../type'

@Injectable()
export class OpenAiProviderService implements AiProvider {
  public constructor(
    @Inject(OPEN_AI_CLIENT_TOKEN) private readonly openAiClient: OpenAI,
    @Inject(getConfigToken(OPEN_AI_ENV_CONFIG_KEY)) private readonly openAiEnvConfig: OpenAiEnvConfig,
  ) {}

  public async generateStructuredJson(input: GenerateStructuredJsonInput): Promise<Record<string, unknown>> {
    return this.createStructuredCompletion(input)
  }

  public async translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
    const response = await this.generateStructuredJson({
      schemaName: 'translation_text',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: {
          text: { type: 'string' },
        },
      },
      systemPrompt:
        input.systemPrompt ??
        'You are a professional translator. Return only valid JSON object that matches schema and do not add new meaning.',
      userContent: [
        {
          type: 'text',
          text: [
            `Translate from ${getLanguageLabelByCode(input.sourceLanguageCode)} to ${getLanguageLabelByCode(input.targetLanguageCode)}.`,
            `Text: ${input.text}`,
          ].join('\n'),
        },
      ],
    })

    return {
      text: normalizeRequiredString(
        response.text,
        'text',
        (message) => new AppInternalException('ai.invalid-output', message),
      ),
    }
  }

  public async generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    try {
      const model = input.model ?? this.openAiEnvConfig.imageModel ?? 'gpt-image-1'
      const outputFormat = input.outputFormat ?? 'png'
      const size = input.size ?? '1024x1024'

      const response = await this.openAiClient.images.generate({
        model,
        prompt: input.prompt,
        n: 1,
        size,
        output_format: outputFormat,
      })

      const image = response.data?.[0]

      if (!image) {
        throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid output.')
      }

      const base64 = image.b64_json

      if (typeof base64 === 'string' && base64.trim().length > 0) {
        const buffer = Buffer.from(base64, 'base64')

        if (buffer.length === 0) {
          throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid output.')
        }

        return {
          buffer,
          mimeType: this.getMimeTypeByFormat(outputFormat),
          providerMeta: {
            revisedPrompt: image.revised_prompt ?? null,
            model,
            size,
            outputFormat,
          },
        }
      }

      if (typeof image.url === 'string' && image.url.length > 0) {
        return this.downloadGeneratedImageByUrl(image.url, image.revised_prompt ?? null, model, size, outputFormat)
      }

      throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid output.')
    } catch (error) {
      if (error instanceof AppInternalException) {
        throw error
      }

      throw new AppInternalException('ai.image-generation-failed', 'AI image generation failed.', {
        reason: error instanceof Error ? error.message : 'Unknown provider error',
      })
    }
  }

  private async createStructuredCompletion(input: GenerateStructuredJsonInput): Promise<Record<string, unknown>> {
    try {
      const completion = await this.openAiClient.chat.completions.create({
        model: input.model ?? this.resolveTextModel(input.mode),
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: input.systemPrompt,
          },
          {
            role: 'user',
            content: <OpenAI.Chat.Completions.ChatCompletionUserMessageParam['content']>input.userContent,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: input.schemaName,
            strict: true,
            schema: input.schema,
          },
        },
      })

      const content = completion.choices[0]?.message?.content

      if (!content) {
        throw new AppInternalException('ai.empty-output', 'AI provider returned empty response.')
      }

      const parsed = JSON.parse(content)

      if (!isRecord(parsed)) {
        throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid JSON output.')
      }

      return parsed
    } catch (error) {
      if (error instanceof AppInternalException) {
        throw error
      }

      throw new AppInternalException('ai.provider-request', 'AI provider request failed.', {
        reason: error instanceof Error ? error.message : 'Unknown provider error',
      })
    }
  }

  private resolveTextModel(mode?: 'text' | 'vision'): string {
    if (mode === 'vision') {
      return this.openAiEnvConfig.visionModel ?? this.openAiEnvConfig.textModel
    }

    return this.openAiEnvConfig.textModel
  }

  private getMimeTypeByFormat(format: string): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg'
      case 'webp':
        return 'image/webp'
      case 'png':
      default:
        return 'image/png'
    }
  }

  private async downloadGeneratedImageByUrl(
    imageUrl: string,
    revisedPrompt: string | null,
    model: string,
    size: string,
    outputFormat: string,
  ): Promise<GenerateImageOutput> {
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Accept: 'image/*',
      },
    })

    if (!response.ok) {
      throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid output.', {
        statusCode: response.status,
      })
    }

    const mimeType = (response.headers.get('content-type') ?? 'image/png').split(';')[0].trim().toLowerCase()

    if (!mimeType.startsWith('image/')) {
      throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid output.', {
        contentType: mimeType,
      })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    if (buffer.length === 0) {
      throw new AppInternalException('ai.invalid-output', 'AI provider returned invalid output.')
    }

    return {
      buffer,
      mimeType,
      providerMeta: {
        revisedPrompt,
        source: 'url',
        model,
        size,
        outputFormat,
      },
    }
  }
}
