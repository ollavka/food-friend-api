import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiAuthorizationExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { ProductApiModel } from '../api-model'
import { UpdateProductDto } from '../dto'

export function UpdateProductDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update product',
      description: 'Update product data and translation in selected language',
    }),
    ApiBody({ type: UpdateProductDto, required: true }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Product successfully updated',
      schema: successApiSchemaRef(ProductApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'id',
        value: 'invalid-id',
        constraints: { isId: 'Field id must be a valid identifier.' },
      },
      {
        property: 'measurementBaseType',
        value: 'INVALID_TYPE',
        constraints: {
          isEnum: `Field measurementBaseType must be one of the allowed values: ${Object.values(MeasurementBaseTypeKey).join(', ')}.`,
        },
      },
    ]),
    ApiAuthorizationExceptionResponse({
      description: 'Current user cannot update this product',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'User has no access to update this product',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiBadRequestExceptionResponse({
      description: 'Invalid product update payload',
      variants: [
        {
          typeKey: 'bad-request.product.translation-name-required',
          summary: 'Name is required when creating translation in new language',
          example: {
            reason: 'Product name is required to create translation for the selected language.',
          },
        },
        {
          typeKey: 'bad-request.product.measurement-unit-mismatch',
          summary: 'Measurement unit is incompatible with base type',
          example: {
            reason: 'Product measurement unit is not compatible with selected measurement base type.',
            measurementUnitId: 'LnT8BAUhhoJ2Y6MuB9AAZp',
            measurementBaseTypeId: 'LnT8BAUhhoJ2Y6MuB9AAZp',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Product or related entity not found',
      variants: [
        {
          summary: 'Product not found',
          entityType: 'Product',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
        {
          summary: 'Measurement base type not found',
          entityType: 'MeasurementBaseType',
          identity: { key: 'MASS' },
        },
        {
          summary: 'Measurement unit not found',
          entityType: 'MeasurementUnit',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
      ],
    }),
  )
}
