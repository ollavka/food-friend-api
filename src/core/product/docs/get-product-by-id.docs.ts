import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiAppEntityNotFoundExceptionResponse, ApiLanguage, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { ProductApiModel } from '../api-model'

export function GetProductByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve product by id',
      description: 'Retrieve single product with translated name by id',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Product successfully retrieved',
      schema: successApiSchemaRef(ProductApiModel),
    }),
    ApiValidationExceptionResponse([
      {
        property: 'id',
        value: 'invalid-id',
        constraints: { isId: 'Field id must be a valid identifier.' },
      },
    ]),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Product not found',
      entityType: 'Product',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
