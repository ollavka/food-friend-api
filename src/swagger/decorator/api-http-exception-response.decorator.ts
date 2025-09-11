import { HttpStatus, Type, applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { P, match } from 'ts-pattern'
import { Nullable } from '@common/type'
import { extractHttpExceptionProperties } from '@common/util'
import { ANY_DOCS_JSON } from '@swagger/constant'
import { ApiExceptionDetails, ApiHttpExceptionResponseVariant } from '@swagger/type'
import { ErrorResponseApiModel, HttpExceptionApiModel } from '../api-model'

export type ApiHttpExceptionOptions = {
  statusCode: HttpStatus
  description?: string
  details?: Nullable<ApiExceptionDetails>
  typeKeyOverride?: string
  messageOverride?: string
  example?: unknown
  variants?: Array<ApiHttpExceptionResponseVariant>
}

export function ApiHttpExceptionResponse({
  statusCode,
  description = 'Error',
  details,
  typeKeyOverride,
  messageOverride,
  example,
  variants = [],
}: ApiHttpExceptionOptions): MethodDecorator {
  if (variants.length > 0) {
    const variantRefModels: Type<unknown>[] = variants
      .map((variant) => (typeof variant.details === 'function' ? (variant.details as Type<unknown>) : null))
      .filter(Boolean) as Type<unknown>[]

    const typeEnum = variants.map((variant) => variant.typeKey)

    const detailsOneOf: Array<ReferenceObject | SchemaObject> = variants.map((variant) => {
      const isRef = typeof variant.details === 'function'
      return match({ details: variant.details, isRef })
        .with({ isRef: true }, () => <ReferenceObject>{ $ref: getSchemaPath(variant.details as Type<unknown>) })
        .with({ details: P.nullish }, () => <SchemaObject>{ type: 'object', additionalProperties: true })
        .otherwise(() => <SchemaObject>variant.details!)
    })

    const examples = Object.fromEntries(
      variants.map((variant) => [
        variant.typeKey,
        {
          summary: variant.summary ?? variant.typeKey,
          value: {
            status: 'error',
            error: {
              type: variant.typeKey,
              message: variant.messageOverride ?? messageOverride ?? extractHttpExceptionProperties(statusCode).message,
              statusCode,
              details: variant.example ?? {},
            },
          },
        },
      ]),
    )

    return applyDecorators(
      ApiExtraModels(ErrorResponseApiModel, HttpExceptionApiModel, ...variantRefModels),
      ApiResponse({
        status: statusCode,
        description,
        content: {
          'application/json': {
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
                            type: { type: 'string', enum: typeEnum },
                            message: {
                              type: 'string',
                              default: messageOverride ?? extractHttpExceptionProperties(statusCode).message,
                            },
                            statusCode: { type: 'number', enum: [statusCode] },
                            details: { oneOf: detailsOneOf },
                          },
                          required: ['type', 'statusCode'],
                        },
                      ],
                    },
                  },
                  required: ['status', 'error'],
                },
              ],
            },
            examples,
          },
        },
      }),
    )
  }

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
