import { Provider } from '@nestjs/common'
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core'
import { serializeInterceptorFactory } from './serialize.interceptor'

export const interceptors: Provider[] = [
  { provide: APP_INTERCEPTOR, useFactory: serializeInterceptorFactory, inject: [Reflector] },
]
