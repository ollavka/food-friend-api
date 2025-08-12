import { HttpStatus, Type, applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { P, match } from 'ts-pattern'
import { Nullable } from '@common/type'
import { extractHttpExceptionProperties } from '@common/util'
import { ANY_DOCS_JSON } from '@swagger/constant'
import { ApiExceptionDetails } from '@swagger/type'
import { ErrorResponseApiModel, HttpExceptionApiModel } from '../api-model'

export type ApiHttpExceptionOptions = {
  statusCode: HttpStatus
  description?: string
  details?: Nullable<ApiExceptionDetails>
  typeKeyOverride?: string
  messageOverride?: string
  example?: unknown
}

export function ApiHttpExceptionResponse({
  statusCode,
  description = 'Error',
  details,
  typeKeyOverride,
  messageOverride,
  example,
}: ApiHttpExceptionOptions): MethodDecorator {
  const isRef = typeof details === 'function'
  const { type, message } = extractHttpExceptionProperties(statusCode)
  const exceptionType = typeKeyOverride ?? type
  const exceptionMessage = messageOverride ?? message

  const detailsSchema = match({ details, isRef })
    .with({ isRef: true }, () => <ReferenceObject>{ $ref: getSchemaPath(<Type<unknown>>details) })
    .with({ details: P.nullish }, () => ANY_DOCS_JSON)
    .otherwise(() => <SchemaObject>details)

  return applyDecorators(
    ApiExtraModels(...(isRef ? [<Type<unknown>>details] : [])),
    ApiResponse({
      status: statusCode,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponseApiModel) },
          {
            properties: {
              status: { type: 'string', enum: ['error'], default: 'error' },
              error: {
                allOf: [
                  { $ref: getSchemaPath(HttpExceptionApiModel) },
                  {
                    properties: {
                      type: { type: 'string', default: exceptionType },
                      message: { type: 'string', default: exceptionMessage },
                      statusCode: { type: 'number', default: statusCode },
                      details: detailsSchema,
                    },
                  },
                ],
              },
            },
            required: ['status', 'error'],
          },
        ],
        ...(example !== undefined ? { example } : {}),
      },
    }),
  )
}
