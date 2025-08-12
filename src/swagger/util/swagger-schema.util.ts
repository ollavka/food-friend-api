/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { ErrorResponseApiModel, SuccessResponseApiModel } from '../api-model'

export function successApiSchemaRef(Model: Function | string): Pick<SchemaObject, 'allOf'> {
  return {
    allOf: [
      { $ref: getSchemaPath(SuccessResponseApiModel) },
      {
        properties: {
          status: { type: 'string', default: 'success' },
          data: { $ref: getSchemaPath(Model) },
        },
        required: ['status', 'data'],
      },
    ],
  }
}

export function successApiSchemaLiteral(literal: any): Pick<SchemaObject, 'allOf'> {
  return {
    allOf: [
      { $ref: getSchemaPath(SuccessResponseApiModel) },
      {
        properties: {
          status: { type: 'string', default: 'success' },
          data: {
            type: 'any',
            default: literal,
          },
        },
        required: ['status', 'data'],
      },
    ],
  }
}

export function errorApiSchemaRef(Model: Function | string): Pick<SchemaObject, 'allOf'> {
  return {
    allOf: [
      { $ref: getSchemaPath(ErrorResponseApiModel) },
      {
        properties: {
          status: { type: 'string', default: 'error' },
          error: { $ref: getSchemaPath(Model) },
        },
        required: ['status', 'error'],
      },
    ],
  }
}
