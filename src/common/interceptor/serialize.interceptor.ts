import { ClassSerializerInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export function serializeInterceptorFactory(reflector: Reflector): ClassSerializerInterceptor {
  return new ClassSerializerInterceptor(reflector, { excludeExtraneousValues: true })
}
