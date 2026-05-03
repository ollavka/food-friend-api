import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger'
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
import { CreateProductDto } from '../dto'

export function CreateProductDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create product',
      description: 'Create a product with translation in selected language',
    }),
    ApiBody({ type: CreateProductDto, required: true }),
    ApiLanguage(),
    ApiCreatedResponse({
      description: 'Product successfully created',
      schema: successApiSchemaRef(ProductApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'name',
        value: '',
        constraints: { isNotEmpty: 'Field name should not be empty.' },
      },
      {
        property: 'measurementBaseType',
        value: 'INVALID_TYPE',
        constraints: {
          isEnum: `Field measurementBaseType must be one of the allowed values: ${Object.values(MeasurementBaseTypeKey).join(', ')}.`,
        },
      },
      {
        property: 'measurementUnitId',
        value: 'invalid-id',
        constraints: { isId: 'Field measurementUnitId must be a valid identifier.' },
      },
    ]),
    ApiAuthorizationExceptionResponse({
      description: 'Regular user cannot create system product',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'Only admin can create system products',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiBadRequestExceptionResponse({
      description: 'Invalid product relation data',
      variants: [
        {
          typeKey: 'bad-request.product.measurement-base-type-required',
          summary: 'Measurement base type is required',
          example: {
            reason: 'Product measurement base type is required.',
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
      description: 'Related entity not found',
      variants: [
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
