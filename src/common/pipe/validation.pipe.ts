import { ValidationPipe } from '@nestjs/common'
import { ValidationExceptionFactory } from '@common/exception'

export function validationPipeFactory(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory(errors) {
      return ValidationExceptionFactory.fromValidationErrors(errors)
    },
  })
}
