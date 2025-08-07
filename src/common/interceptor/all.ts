import { Provider } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { SerializeInterceptor } from './serialize.interceptor'

export const interceptors: Provider[] = [{ provide: APP_INTERCEPTOR, useClass: SerializeInterceptor }]
