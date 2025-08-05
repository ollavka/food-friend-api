import { Provider } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { validationPipeFactory } from './validation.pipe'

export const pipes: Provider[] = [
  {
    provide: APP_PIPE,
    useFactory: validationPipeFactory,
  },
]
