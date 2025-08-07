import { BadRequestException, Catch, HttpStatus } from '@nestjs/common'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: BadRequestException): Exception {
    return new Exception(error.message.replace(/\.+$/, '') + '.', {
      type: 'bad-request',
      httpStatus: HttpStatus.BAD_REQUEST,
      stack: error.stack,
    })
  }
}
