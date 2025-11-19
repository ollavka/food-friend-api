import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { Response } from 'express'
import { I18nContext } from 'nestjs-i18n'
import { Exception } from '@common/exception'
import { isDev, toJsonString } from '@common/util'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name)

  public catch(error: Error, host: ArgumentsHost): void {
    const exception = this.errorToException(error)
    this.logException(exception)
    this.handleHttpException(exception, host)
  }

  protected errorToException(error: unknown): Exception {
    if (error instanceof Exception) {
      return error
    }

    if (!(error instanceof Error)) {
      return new Exception('Unknown error.', { details: { error } })
    }

    return new Exception(error.message, { stack: error.stack })
  }

  private logException(exception: Exception): void {
    if (exception.isInternal) {
      const { type, message, details, trace } = exception
      const info = { type, message, details, trace }
      this.logger.error(toJsonString(info))
    }
  }

  private handleHttpException(exception: Exception, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const { details, httpStatus, message, type, isInternal, trace } = exception
    const isDevEnv = isDev()
    const translationArgs = this.getTranslationArgs(details)
    const localizedMessage = this.translateErrorMessage(type, message, translationArgs)
    const localizedDetails = this.localizeDetails(type, details, translationArgs)
    const fallbackInternal =
      'Internal error occurred. Please contact Food Friend support for more information regarding further actions.'
    const hiddenMessage = this.translateWithFallback(
      'errors.internal.generic.message',
      fallbackInternal,
      translationArgs,
    )

    response.status(httpStatus).json({
      status: 'error',
      error: {
        type,
        statusCode: httpStatus,
        message: !isDevEnv && isInternal ? hiddenMessage : localizedMessage,
        details: localizedDetails,
        ...(isDevEnv && isInternal ? { trace } : {}),
      },
    })
  }

  private getTranslationArgs(details: Exception['details']): Record<string, unknown> | undefined {
    if (!details || typeof details !== 'object') {
      return undefined
    }

    return details
  }

  private translateErrorMessage(type: string, fallback: string, args?: Record<string, unknown>): string {
    const messageKeys = this.buildMessageTranslationKeys(type)
    return this.translateWithFallback(messageKeys, fallback, args)
  }

  private translateErrorReason(type: string, fallback: string, args?: Record<string, unknown>): string {
    const reasonKey = this.buildReasonTranslationKey(type)
    return this.translateWithFallback(reasonKey, fallback, args)
  }

  private buildMessageTranslationKeys(type: string): string[] {
    if (!type) {
      return []
    }

    const segments = type.split('.')
    const keys: string[] = []

    for (let i = segments.length; i > 0; i--) {
      const current = segments.slice(0, i).join('.')
      keys.push(`errors.${current}.message`)
    }

    return keys
  }

  private buildReasonTranslationKey(type: string): string | null {
    if (!type) {
      return null
    }

    return `errors.${type}.reason`
  }

  private translateWithFallback(
    key: string | string[] | null,
    fallback: string,
    args?: Record<string, unknown>,
  ): string {
    const i18n = I18nContext.current()

    if (!i18n || !key) {
      return fallback
    }

    const keys = Array.isArray(key) ? key : [key]

    for (const item of keys) {
      if (!item) {
        continue
      }

      try {
        const value = i18n.t(item, { args })

        if (typeof value === 'string') {
          return value
        }
      } catch {
        continue
      }
    }

    return fallback
  }

  private localizeDetails(
    type: string,
    details: Exception['details'],
    args?: Record<string, unknown>,
  ): Exception['details'] {
    if (!details || typeof details !== 'object') {
      return details ?? null
    }

    const normalizedDetails: Record<string, unknown> = { ...details }
    const { reason } = normalizedDetails

    if (typeof reason === 'string' && reason.length > 0) {
      normalizedDetails.reason = this.translateErrorReason(type, reason, { ...normalizedDetails, ...args })
    }

    return normalizedDetails
  }
}
