import { Inject, Injectable } from '@nestjs/common'
import { getConfigToken } from '@nestjs/config'
import { AppInternalException } from '@common/exception'
import { MEILISEARCH_ENV_CONFIG_KEY, MeilisearchEnvConfig } from '../config'

type IndexSettings = {
  searchableAttributes: string[]
  filterableAttributes?: string[]
  sortableAttributes?: string[]
}

type SearchParams = {
  page?: number
  hitsPerPage?: number
  filter?: string | string[]
  limit?: number
  offset?: number
}

type SearchResponse<T = Record<string, unknown>> = {
  hits: T[]
  estimatedTotalHits?: number
  totalHits?: number
  total?: number
}

type MeilisearchTaskResponse = {
  taskUid?: number
  uid?: number
}

type MeilisearchTaskDetailsResponse = {
  status?: string
  error?: {
    code?: string
    message?: string
  }
}

@Injectable()
export class MeilisearchService {
  private readonly configuredIndexes = new Set<string>()

  private readonly host: string

  public constructor(
    @Inject(getConfigToken(MEILISEARCH_ENV_CONFIG_KEY)) private readonly meilisearchEnvConfig: MeilisearchEnvConfig,
  ) {
    this.host = this.normalizeHost(this.meilisearchEnvConfig.host)
  }

  public get recipesIndexUid(): string {
    return this.meilisearchEnvConfig.recipesIndexUid
  }

  public get productsIndexUid(): string {
    return this.meilisearchEnvConfig.productsIndexUid
  }

  public async ensureIndex(indexUid: string, settings: IndexSettings): Promise<void> {
    if (this.configuredIndexes.has(indexUid)) {
      return
    }

    try {
      await this.enqueueTask('POST', '/indexes', {
        uid: indexUid,
        primaryKey: 'id',
      })
    } catch (error) {
      if (!this.isAlreadyExistsError(error)) {
        throw this.wrapProviderError('create-index', error)
      }
    }

    try {
      await this.enqueueTask('PATCH', `/indexes/${encodeURIComponent(indexUid)}/settings`, {
        searchableAttributes: settings.searchableAttributes,
        filterableAttributes: settings.filterableAttributes,
        sortableAttributes: settings.sortableAttributes,
      })
    } catch (error) {
      throw this.wrapProviderError('update-settings', error)
    }

    this.configuredIndexes.add(indexUid)
  }

  public async upsertDocuments(indexUid: string, documents: Array<Record<string, unknown>>): Promise<void> {
    if (documents.length === 0) {
      return
    }

    try {
      await this.enqueueTask('POST', `/indexes/${encodeURIComponent(indexUid)}/documents`, documents)
    } catch (error) {
      throw this.wrapProviderError('upsert-documents', error)
    }
  }

  public async deleteDocument(indexUid: string, id: string): Promise<void> {
    try {
      await this.enqueueTask('DELETE', `/indexes/${encodeURIComponent(indexUid)}/documents/${encodeURIComponent(id)}`)
    } catch (error) {
      throw this.wrapProviderError('delete-document', error)
    }
  }

  public async deleteDocuments(indexUid: string, ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return
    }

    try {
      await this.enqueueTask('POST', `/indexes/${encodeURIComponent(indexUid)}/documents/delete-batch`, ids)
    } catch (error) {
      throw this.wrapProviderError('delete-documents', error)
    }
  }

  public async deleteAllDocuments(indexUid: string): Promise<void> {
    try {
      await this.enqueueTask('DELETE', `/indexes/${encodeURIComponent(indexUid)}/documents`)
    } catch (error) {
      throw this.wrapProviderError('delete-all-documents', error)
    }
  }

  public async search(
    indexUid: string,
    query: string,
    params?: SearchParams,
  ): Promise<SearchResponse<Record<string, unknown>>> {
    try {
      const response = await this.request<SearchResponse<Record<string, unknown>>>(
        'POST',
        `/indexes/${encodeURIComponent(indexUid)}/search`,
        {
          q: query,
          ...(params ?? {}),
        },
      )

      return {
        hits: Array.isArray(response.hits) ? response.hits : [],
        estimatedTotalHits: typeof response.estimatedTotalHits === 'number' ? response.estimatedTotalHits : undefined,
        totalHits: typeof response.totalHits === 'number' ? response.totalHits : undefined,
        total: typeof response.total === 'number' ? response.total : undefined,
      }
    } catch (error) {
      throw this.wrapProviderError('search', error)
    }
  }

  private async enqueueTask(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<void> {
    const response = await this.request<MeilisearchTaskResponse>(method, path, body)
    const taskUid = this.extractTaskUid(response)

    if (taskUid !== null) {
      await this.waitForTask(taskUid)
    }
  }

  private async waitForTask(taskUid: number): Promise<void> {
    const maxAttempts = 120
    const pollIntervalMs = 250

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await this.request<MeilisearchTaskDetailsResponse>('GET', `/tasks/${taskUid}`)
      const status = typeof response.status === 'string' ? response.status : null

      if (status === 'succeeded') {
        return
      }

      if (status === 'failed' || status === 'canceled') {
        const providerError = response.error

        throw this.wrapProviderError('task-failed', {
          code: providerError?.code,
          message: providerError?.message ?? `Meilisearch task ${taskUid} failed with status "${status}".`,
        })
      }

      await this.sleep(pollIntervalMs)
    }

    throw new AppInternalException('search.provider-request', 'Search provider request failed.', {
      action: 'wait-task-timeout',
      taskUid,
    })
  }

  private extractTaskUid(response: MeilisearchTaskResponse): number | null {
    if (typeof response.taskUid === 'number' && Number.isFinite(response.taskUid)) {
      return response.taskUid
    }

    if (typeof response.uid === 'number' && Number.isFinite(response.uid)) {
      return response.uid
    }

    return null
  }

  private async request<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method,
      headers: this.buildHeaders(body !== undefined),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
      throw await this.parseProviderHttpError(response)
    }

    if (response.status === 204) {
      return <T>{}
    }

    const responseBody = await response.text()

    if (!responseBody) {
      return <T>{}
    }

    try {
      return <T>JSON.parse(responseBody)
    } catch {
      throw new AppInternalException('search.provider-request', 'Search provider request failed.', {
        action: 'parse-response',
        statusCode: response.status,
      })
    }
  }

  private async parseProviderHttpError(response: Response): Promise<{ code?: string; message: string }> {
    const fallbackMessage = `Search provider request failed with status ${response.status}.`
    const responseText = await response.text()

    if (!responseText) {
      return { message: fallbackMessage }
    }

    try {
      const parsed = JSON.parse(responseText) as { code?: unknown; message?: unknown }
      const code = typeof parsed.code === 'string' ? parsed.code : undefined
      const message = typeof parsed.message === 'string' ? parsed.message : fallbackMessage

      return {
        code,
        message,
      }
    } catch {
      return {
        message: fallbackMessage,
      }
    }
  }

  private buildHeaders(withJsonBody: boolean): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (withJsonBody) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.meilisearchEnvConfig.apiKey) {
      headers.Authorization = `Bearer ${this.meilisearchEnvConfig.apiKey}`
    }

    return headers
  }

  private buildUrl(path: string): string {
    return `${this.host}${path.startsWith('/') ? path : `/${path}`}`
  }

  private normalizeHost(host: string): string {
    return host.replace(/\/+$/g, '')
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  private isAlreadyExistsError(error: unknown): boolean {
    const details = this.extractErrorDetails(error)

    return (
      details.code === 'index_already_exists' ||
      details.message.toLowerCase().includes('already exists') ||
      details.message.toLowerCase().includes('already exist')
    )
  }

  private wrapProviderError(action: string, error: unknown): AppInternalException {
    const details = this.extractErrorDetails(error)

    return new AppInternalException('search.provider-request', 'Search provider request failed.', {
      action,
      code: details.code,
      reason: details.message,
    })
  }

  private extractErrorDetails(error: unknown): { code?: string; message: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
      }
    }

    if (typeof error === 'object' && error !== null) {
      const maybeError = error as { code?: unknown; message?: unknown; cause?: { message?: unknown } }
      const code = typeof maybeError.code === 'string' ? maybeError.code : undefined
      const message =
        typeof maybeError.message === 'string'
          ? maybeError.message
          : typeof maybeError.cause?.message === 'string'
            ? maybeError.cause.message
            : 'Unknown search provider error.'

      return {
        code,
        message,
      }
    }

    return {
      message: 'Unknown search provider error.',
    }
  }
}
