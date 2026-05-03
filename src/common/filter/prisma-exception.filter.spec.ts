import { describe, expect, it } from '@jest/globals'
import { HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaExceptionFilter } from './prisma-exception.filter'

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter()

  const createKnownError = (code: string, message = 'Known prisma error', meta?: Record<string, unknown>): Error => {
    const error = Object.assign(new Error(message), {
      code,
      meta,
    })

    Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype)
    return error
  }

  const createValidationError = (message = 'Validation prisma error'): Error => {
    const error = new Error(message)
    Object.setPrototypeOf(error, Prisma.PrismaClientValidationError.prototype)
    return error
  }

  const createInitializationError = (message = 'Initialization prisma error'): Error => {
    const error = new Error(message)
    Object.setPrototypeOf(error, Prisma.PrismaClientInitializationError.prototype)
    return error
  }

  const createRustPanicError = (message = 'Rust panic prisma error'): Error => {
    const error = new Error(message)
    Object.setPrototypeOf(error, Prisma.PrismaClientRustPanicError.prototype)
    return error
  }

  it('should map unique constraint violation for known request error', () => {
    const exception = (filter as any).errorToException(createKnownError('P2002', 'Unique error', { target: ['email'] }))

    expect(exception.type).toBe('db.unique-violation')
    expect(exception.httpStatus).toBe(HttpStatus.CONFLICT)
    expect(exception.details).toEqual({
      reason: 'Unique error',
      target: ['email'],
    })
  })

  it('should map not found and relation conflict error codes', () => {
    const notFound = (filter as any).errorToException(createKnownError('P2025'))
    const relationConflict = (filter as any).errorToException(createKnownError('P2003'))

    expect(notFound.type).toBe('db.not-found')
    expect(notFound.httpStatus).toBe(HttpStatus.NOT_FOUND)
    expect(relationConflict.type).toBe('db.relation-conflict')
    expect(relationConflict.httpStatus).toBe(HttpStatus.CONFLICT)
  })

  it('should map unknown known-request code to request-error', () => {
    const exception = (filter as any).errorToException(createKnownError('P9999'))

    expect(exception.type).toBe('db.request-error.P9999')
    expect(exception.httpStatus).toBe(HttpStatus.BAD_REQUEST)
  })

  it('should map validation, initialization and rust panic errors', () => {
    const validation = (filter as any).errorToException(createValidationError())
    const initialization = (filter as any).errorToException(createInitializationError())
    const rustPanic = (filter as any).errorToException(createRustPanicError())

    expect(validation.type).toBe('db.validation')
    expect(validation.httpStatus).toBe(HttpStatus.BAD_REQUEST)
    expect(initialization.type).toBe('internal.db.init')
    expect(initialization.httpStatus).toBe(HttpStatus.SERVICE_UNAVAILABLE)
    expect(rustPanic.type).toBe('internal.db.rust-panic')
    expect(rustPanic.httpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
  })
})
