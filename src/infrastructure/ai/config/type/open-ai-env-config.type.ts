export type OpenAiEnvConfig = {
  apiKey: string
  baseUrl?: string
  textModel: string
  visionModel?: string
  imageModel?: string
  timeoutMs: number
  maxRetries: number
}
