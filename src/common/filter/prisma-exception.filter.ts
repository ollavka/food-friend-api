import { Catch, HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PRISMA_ERRORS } from '@common/constant'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(...PRISMA_ERRORS)
export class PrismaExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: unknown): Exception {
    const reason = (error as Error)?.message ?? ''
    const details = { ...(reason ? { reason } : {}) }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const code = error.code
      const meta = error.meta as Record<string, unknown> | undefined

      switch (code) {
        case 'P2002': {
          const target = meta?.target
          return new Exception('Unique constraint violation.', {
            type: 'db.unique-violation',
            httpStatus: HttpStatus.CONFLICT,
            details: { ...details, ...(target ? { target } : {}) },
            stack: (error as Error).stack,
          })
        }
        case 'P2025':
        case 'P2001':
          return new Exception('Requested resource was not found.', {
            type: 'db.not-found',
            httpStatus: HttpStatus.NOT_FOUND,
            stack: (error as Error).stack,
            details,
          })
        case 'P2003':
        case 'P2014':
          return new Exception('Operation conflicts with existing relations.', {
            type: 'db.relation-conflict',
            httpStatus: HttpStatus.CONFLICT,
            stack: (error as Error).stack,
            details,
          })
        default:
          return new Exception('Database request error.', {
            type: `db.request-error.${code}`,
            httpStatus: HttpStatus.BAD_REQUEST,
            stack: (error as Error).stack,
            details,
          })
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return new Exception('Validation failed for the provided data.', {
        type: 'db.validation',
        httpStatus: HttpStatus.BAD_REQUEST,
        stack: (error as Error).stack,
        details,
      })
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return new Exception('Database initialization failed.', {
        type: 'db.init',
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
        stack: (error as Error).stack,
        details,
      }).internal()
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return new Exception('Database engine encountered an unexpected error.', {
        type: 'db.rust-panic',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        stack: (error as Error).stack,
        details,
      }).internal()
    }

    return super.errorToException(error)
  }
}
