import { Catch, ConflictException, HttpStatus, NotFoundException } from '@nestjs/common'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(ConflictException)
export class ConflictExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: NotFoundException): Exception {
    return new Exception('Conflict.', {
      type: 'conflict',
      httpStatus: HttpStatus.CONFLICT,
      stack: error.stack,
    })
  }
}
