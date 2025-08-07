import { HttpStatus } from '@nestjs/common'
import { Nullable } from '@common/type'

type ExceptionDetails = Record<string, unknown>

interface BaseExceptionParams {
  type?: string
  httpStatus?: HttpStatus
  details?: Nullable<ExceptionDetails>
  stack?: string
}

export class Exception extends Error implements BaseExceptionParams {
  public type: string

  public httpStatus: HttpStatus

  public details: Nullable<ExceptionDetails>

  public get isInternal(): boolean {
    return this.type.startsWith('internal')
  }

  public get trace(): string[] {
    return (this.stack ?? '')
      .replace(this.message, '')
      .split('\n')
      .slice(1)
      .map((item) => item.replace(/^ +at /, ''))
  }

  public constructor(message: string, params?: BaseExceptionParams) {
    super(message)
    const { type, httpStatus, details, stack } = params ?? {}
    this.type = type ?? 'internal'
    this.httpStatus = httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR
    this.details = details ?? null
    this.stack = stack
  }

  public internal(): this {
    if (!this.isInternal) {
      this.type = `internal.${this.type}`
    }

    return this
  }
}
