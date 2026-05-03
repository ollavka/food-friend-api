import { describe, expect, it } from '@jest/globals'
import { swaggerExtraModels } from './all'
import { ErrorResponseApiModel } from './error-response.api-model'
import { HttpExceptionApiModel } from './http-exception.api-model'
import { SuccessResponseApiModel } from './success-response.api-model'

describe('swaggerExtraModels', () => {
  it('should expose all shared swagger extra models', () => {
    expect(swaggerExtraModels).toEqual([SuccessResponseApiModel, ErrorResponseApiModel, HttpExceptionApiModel])
  })
})
