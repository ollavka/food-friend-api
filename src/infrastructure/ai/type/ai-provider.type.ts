import { LanguageCode } from '@prisma/client'

export type GenerateStructuredJsonContentPart =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'image_url'
      image_url: {
        url: string
      }
    }

export type GenerateStructuredJsonInput = {
  schemaName: string
  schema: Record<string, unknown>
  systemPrompt: string
  userContent: GenerateStructuredJsonContentPart[]
  mode?: 'text' | 'vision'
  model?: string
}

export type TranslateTextInput = {
  text: string
  sourceLanguageCode: LanguageCode
  targetLanguageCode: LanguageCode
  systemPrompt?: string
}

export type TranslateTextOutput = {
  text: string
}

export type GenerateImageInput = {
  prompt: string
  model?: string
  size?: '1024x1024' | '1024x1536' | '1536x1024'
  outputFormat?: 'png' | 'jpeg' | 'webp'
}

export type GenerateImageOutput = {
  buffer: Buffer
  mimeType: string
  providerMeta?: Record<string, unknown>
}

export type AiProvider = {
  generateStructuredJson(input: GenerateStructuredJsonInput): Promise<Record<string, unknown>>
  translateText(input: TranslateTextInput): Promise<TranslateTextOutput>
  generateImage(input: GenerateImageInput): Promise<GenerateImageOutput>
}
