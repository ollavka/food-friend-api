import { Catch, HttpStatus, NotFoundException } from '@nestjs/common'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(NotFoundException)
export class ResourceNotFoundExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: NotFoundException): Exception {
    return new Exception('Resource not found.', {
      type: 'resource-not-found',
      httpStatus: HttpStatus.NOT_FOUND,
      stack: error.stack,
    })
  }
}
