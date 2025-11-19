import { Catch, InternalServerErrorException } from '@nestjs/common'
import { AppInternalException, Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: InternalServerErrorException): Exception {
    return new AppInternalException('generic', error.message)
  }
}
