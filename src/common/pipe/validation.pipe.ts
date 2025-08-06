import { ValidationPipe } from '@nestjs/common'

export function validationPipeFactory(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
  })
}
