import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { Response } from 'express'
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

    response.status(httpStatus).json({
      status: 'error',
      error: {
        type,
        statusCode: httpStatus,
        message:
          !isDevEnv && isInternal
            ? 'Internal error occurred. Please contact Food Friend support for more information regarding further actions.'
            : message,
        details: details ?? null,
        ...(isDevEnv && isInternal ? { trace } : {}),
      },
    })
  }
}
