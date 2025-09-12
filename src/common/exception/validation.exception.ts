import { HttpStatus } from '@nestjs/common'
import { Exception } from '.'

export interface ValidationEntry {
  property: string | string[]
  value?: unknown
  constraints: Record<string, string>
}

export class ValidationException extends Exception {
  public type = 'validation'

  public httpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY

  public constructor(...entries: ValidationEntry[]) {
    super('Validation failed.')
    this.details = { entries }
  }
}
