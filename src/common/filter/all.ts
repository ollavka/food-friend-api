import { Provider } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import {
  AppExceptionFilter,
  AuthenticationExceptionFilter,
  AuthorizationExceptionFilter,
  HttpExceptionFallbackFilter,
  NotFoundExceptionFilter,
  PrismaExceptionFilter,
} from '.'

export const filters: Provider[] = [
  AppExceptionFilter,
  HttpExceptionFallbackFilter,
  PrismaExceptionFilter,
  NotFoundExceptionFilter,
  AuthorizationExceptionFilter,
  AuthenticationExceptionFilter,
].map((exceptionFilter) => ({
  provide: APP_FILTER,
  useClass: exceptionFilter,
}))
