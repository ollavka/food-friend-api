import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import { TextCase } from '@common/enum'
import { Exception } from '@common/exception'
import { TextCaseConverter, enumKey } from '@common/util'
import { AppExceptionFilter } from '.'

@Catch(HttpException)
export class HttpExceptionFallbackFilter extends AppExceptionFilter {
  protected errorToException(error: HttpException): Exception {
    const statusCode = error.getStatus()
    const exceptionTypeRaw = enumKey(HttpStatus, statusCode) ?? 'http-request'
    const exceptionType = TextCaseConverter.convert(exceptionTypeRaw, TextCase.Spinal)
    const errorMessage = `${TextCaseConverter.convert(exceptionTypeRaw, TextCase.Space)}.`

    return new Exception(errorMessage, {
      type: exceptionType,
      httpStatus: statusCode,
      details: {
        reason: error.message,
      },
      stack: error.stack,
    })
  }
}
