import { Catch, InternalServerErrorException } from '@nestjs/common'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: InternalServerErrorException): Exception {
    return new Exception(
      'Internal error occurred. Please contact Food Friend support for more information regarding further actions.',
      {
        details: {
          reason: error.message,
        },
        stack: error.stack,
      },
    ).internal()
  }
}
