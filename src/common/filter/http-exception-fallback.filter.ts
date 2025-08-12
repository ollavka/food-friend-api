import { Catch, HttpException } from '@nestjs/common'
import { Exception } from '@common/exception'
import { extractHttpExceptionProperties } from '@common/util'
import { AppExceptionFilter } from '.'

@Catch(HttpException)
export class HttpExceptionFallbackFilter extends AppExceptionFilter {
  protected errorToException(error: HttpException): Exception {
    const statusCode = error.getStatus()
    const { type, message } = extractHttpExceptionProperties(statusCode)

    return new Exception(message, {
      type,
      httpStatus: statusCode,
      details: {
        reason: error.message,
      },
      stack: error.stack,
    })
  }
}
