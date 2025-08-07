import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { Response } from 'express'
import { Exception } from '@common/exception'
import { IS_DEV } from '@common/util'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name)

  public catch(error: Error, host: ArgumentsHost): void {
    const exception = this.errorToException(error)
    this.logException(exception)

    switch (host.getType()) {
      case 'http':
        this.handleHttpException(exception, host)
        break

      default:
        throw exception
    }
  }

  protected errorToException(error: unknown): Exception {
    if (error instanceof Exception) {
      return error
    } else if (!(error instanceof Error)) {
      return new Exception('Unknown error.', { details: { error } })
    }

    return new Exception(error.message, { stack: error.stack })
  }

  private logException(exception: Exception): void {
    if (exception.isInternal) {
      const { type, message, details, trace } = exception
      const info = { type, message, details, trace }
      this.logger.error(JSON.stringify(info, null, 2))
    }
  }

  private handleHttpException(exception: Exception, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const { details, httpStatus, message, type, isInternal, trace } = exception

    response.status(httpStatus).json({
      status: 'error',
      error: {
        type,
        message:
          !IS_DEV && isInternal
            ? 'Internal error occurred. Please contact Food Friend support for more information regarding further actions.'
            : message,
        details: details ?? null,
        ...(IS_DEV && isInternal ? { trace } : {}),
      },
    })
  }
}
