import { describe, expect, it } from '@jest/globals'
import { APP_FILTER } from '@nestjs/core'
import { filters } from './all'
import {
  AppExceptionFilter,
  AuthenticationExceptionFilter,
  AuthorizationExceptionFilter,
  HttpExceptionFallbackFilter,
  InternalServerErrorExceptionFilter,
  NotFoundExceptionFilter,
  PrismaExceptionFilter,
} from '.'

describe('filters', () => {
  it('should register all app filters with APP_FILTER token', () => {
    const providers = filters as Array<{ provide: unknown; useClass: unknown }>

    expect(filters).toHaveLength(7)
    expect(providers.every((provider) => provider.provide === APP_FILTER)).toBe(true)
    expect(providers.map((provider) => provider.useClass)).toEqual([
      AppExceptionFilter,
      HttpExceptionFallbackFilter,
      InternalServerErrorExceptionFilter,
      PrismaExceptionFilter,
      NotFoundExceptionFilter,
      AuthorizationExceptionFilter,
      AuthenticationExceptionFilter,
    ])
  })
})
