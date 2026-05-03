import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { ApiLanguage, ApiResourceQuery, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { PaginatedSearchProductsApiModel } from '../api-model'
import { SearchProductFilterQueryDto } from '../dto'

export function SearchProductsDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Search products',
      description: 'Search products in Meilisearch index with localized output and pagination.',
    }),
    ApiResourceQuery<SearchProductFilterQueryDto>({
      filter: {
        fields: {
          search: {
            description: 'Case-insensitive full-text query by product name or slug',
            example: 'potato',
          },
          measurementBaseType: {
            description: 'Measurement base type filter',
            enum: MeasurementBaseTypeKey,
            example: MeasurementBaseTypeKey.MASS,
          },
          isSystem: {
            description: 'Filter by system product flag',
            example: true,
          },
        },
      },
      pagination: {
        enabled: true,
      },
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Search products successfully retrieved',
      schema: successApiSchemaRef(PaginatedSearchProductsApiModel),
    }),
    ApiValidationExceptionResponse([
      {
        property: 'filter.measurementBaseType',
        value: 'INVALID_TYPE',
        constraints: {
          isEnum: `Field filter.measurementBaseType must be one of the allowed values: ${Object.values(MeasurementBaseTypeKey).join(', ')}.`,
        },
      },
      {
        property: 'filter.isSystem',
        value: 'invalid-boolean',
        constraints: { isBoolean: 'Field filter.isSystem must be boolean.' },
      },
      {
        property: 'pagination.page',
        value: 0,
        constraints: { min: 'Field pagination.page must not be less than 1.' },
      },
      {
        property: 'pagination.limit',
        value: 101,
        constraints: { max: 'Field pagination.limit must be less or equals to 100.' },
      },
    ]),
  )
}
