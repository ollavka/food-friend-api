import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import { AppInternalException } from '@common/exception'
import { OpenAiProviderService } from './open-ai-provider.service'

describe('OpenAiProviderService', () => {
  const openAiClient: any = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    images: {
      generate: jest.fn(),
    },
  }

  const envConfig = {
    apiKey: 'key',
    textModel: 'gpt-4.1-mini',
    visionModel: 'gpt-4.1',
    imageModel: 'gpt-image-1',
    timeoutMs: 30_000,
    maxRetries: 2,
  }

  let service: OpenAiProviderService
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    service = new OpenAiProviderService(openAiClient, envConfig)
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should generate structured json output', async () => {
    openAiClient.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: 'Soup' }) } }],
    })

    const result = await service.generateStructuredJson({
      schemaName: 'recipe',
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { title: { type: 'string' } },
      },
      systemPrompt: 'system',
      userContent: [{ type: 'text', text: 'Create recipe' }],
    })

    expect(result).toEqual({ title: 'Soup' })
    expect(openAiClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4.1-mini',
      }),
    )
  })

  it('should translate text via structured json contract', async () => {
    openAiClient.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ text: 'Привіт' }) } }],
    })

    const result = await service.translateText({
      text: 'Hello',
      sourceLanguageCode: LanguageCode.EN,
      targetLanguageCode: LanguageCode.UK,
    })

    expect(result.text).toBe('Привіт')
  })

  it('should generate image from base64 response', async () => {
    const buffer = Buffer.from('image-content')

    openAiClient.images.generate.mockResolvedValue({
      data: [{ b64_json: buffer.toString('base64'), revised_prompt: 'revised' }],
    })

    const result = await service.generateImage({
      prompt: 'Generate recipe photo',
      outputFormat: 'png',
    })

    expect(result.buffer.length).toBeGreaterThan(0)
    expect(result.mimeType).toBe('image/png')
    expect(result.providerMeta).toMatchObject({ revisedPrompt: 'revised' })
  })

  it('should generate image from url response', async () => {
    openAiClient.images.generate.mockResolvedValue({
      data: [{ url: 'https://example.com/image.png', revised_prompt: 'revised-url' }],
    })
    ;(global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (header: string) => (header === 'content-type' ? 'image/png' : null),
      },
      arrayBuffer: async () => Buffer.from('image-content'),
    } as never)

    const result = await service.generateImage({ prompt: 'Generate recipe photo from url' })

    expect(result.mimeType).toBe('image/png')
    expect(result.providerMeta).toMatchObject({ source: 'url' })
  })

  it('should throw internal exception on invalid json output', async () => {
    openAiClient.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(['invalid']) } }],
    })

    await expect(
      service.generateStructuredJson({
        schemaName: 'recipe',
        schema: { type: 'object' },
        systemPrompt: 'system',
        userContent: [{ type: 'text', text: 'Create recipe' }],
      }),
    ).rejects.toBeInstanceOf(AppInternalException)
  })

  it('should throw internal exception when image generation fails', async () => {
    openAiClient.images.generate.mockRejectedValue(new Error('provider failed'))

    await expect(service.generateImage({ prompt: 'Generate photo' })).rejects.toBeInstanceOf(AppInternalException)
  })
})
