import { Type } from '@nestjs/common'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export type ApiExceptionDetails = Type<unknown> | SchemaObject | undefined
