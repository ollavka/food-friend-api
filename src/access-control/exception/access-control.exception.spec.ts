import { describe, expect, it } from '@jest/globals'
import { HttpStatus } from '@nestjs/common'
import { AccessControlAuthenticationException, AccessControlAuthorizationException } from '@access-control/exception'

describe('Access control exceptions', () => {
  it('should build authentication exception payload', () => {
    const error = new AccessControlAuthenticationException('jwt', 'Token is invalid', {
      reasonCode: 'invalid-token',
      stack: 'trace',
    })

    expect(error.httpStatus).toBe(HttpStatus.UNAUTHORIZED)
    expect(error.type).toBe('access-control.authentication.jwt')
    expect(error.details).toMatchObject({ reason: 'Token is invalid', reasonCode: 'invalid-token' })
  })

  it('should build authorization exception payload', () => {
    const error = new AccessControlAuthorizationException(null, 'Access denied', {
      scope: 'admin',
      stack: 'trace',
    })

    expect(error.httpStatus).toBe(HttpStatus.FORBIDDEN)
    expect(error.type).toBe('access-control.authorization')
    expect(error.details).toMatchObject({ reason: 'Access denied', scope: 'admin' })
  })
})
