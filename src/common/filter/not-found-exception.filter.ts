import { Catch, HttpStatus, NotFoundException } from '@nestjs/common'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: NotFoundException): Exception {
    return new Exception('Resource not found.', {
      type: 'not-found',
      httpStatus: HttpStatus.NOT_FOUND,
      details: {
        reason: error.message,
      },
      stack: error.stack,
    })
  }
}
