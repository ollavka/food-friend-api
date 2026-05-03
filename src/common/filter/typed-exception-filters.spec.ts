import { describe, expect, it } from '@jest/globals'
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { AccessControlAuthenticationException, AccessControlAuthorizationException } from '@access-control/exception'
import { AppInternalException, Exception } from '@common/exception'
import { AuthenticationExceptionFilter } from './authentication-exception.filter'
import { AuthorizationExceptionFilter } from './authorization-exception.filter'
import { HttpExceptionFallbackFilter } from './http-exception-fallback.filter'
import { InternalServerErrorExceptionFilter } from './internal-exception.filter'
import { NotFoundExceptionFilter } from './not-found-exception.filter'

describe('Typed exception filters', () => {
  it('should map unauthorized error to authentication exception', () => {
    const filter = new AuthenticationExceptionFilter()
    const result = (filter as any).errorToException(new UnauthorizedException('Unauthorized'))

    expect(result).toBeInstanceOf(AccessControlAuthenticationException)
    expect(result.type).toBe('access-control.authentication')
  })

  it('should map forbidden error to authorization exception', () => {
    const filter = new AuthorizationExceptionFilter()
    const result = (filter as any).errorToException(new ForbiddenException('Forbidden'))

    expect(result).toBeInstanceOf(AccessControlAuthorizationException)
    expect(result.type).toBe('access-control.authorization')
  })

  it('should map internal server error exception', () => {
    const filter = new InternalServerErrorExceptionFilter()
    const result = (filter as any).errorToException(new InternalServerErrorException('Boom'))

    expect(result).toBeInstanceOf(AppInternalException)
    expect(result.type).toBe('internal.generic')
  })

  it('should map not found exception to public exception contract', () => {
    const filter = new NotFoundExceptionFilter()
    const result = (filter as any).errorToException(new NotFoundException('Not found')) as Exception

    expect(result.httpStatus).toBe(HttpStatus.NOT_FOUND)
    expect(result.type).toBe('not-found')
    expect(result.details).toMatchObject({ reason: 'Not found' })
  })

  it('should map generic http exception using status metadata', () => {
    const filter = new HttpExceptionFallbackFilter()
    const result = (filter as any).errorToException(new HttpException('Bad request', HttpStatus.BAD_REQUEST))

    expect(result.httpStatus).toBe(HttpStatus.BAD_REQUEST)
    expect(result.type).toBe('bad-request')
    expect(result.message).toBe('Bad request.')
  })
})
