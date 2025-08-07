import { Provider } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import * as CustomExceptionFilters from '.'

export const filters: Provider[] = Object.values(CustomExceptionFilters).map((exceptionFilter) => ({
  provide: APP_FILTER,
  useClass: exceptionFilter,
}))
