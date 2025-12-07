import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { SortOrder } from '@common/enum'
import { ApiLanguage, ApiResourceQuery, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { PaginatedProductsApiModel } from '../api-model'
import { PRODUCT_AVAILABLE_SORT_FIELDS } from '../constant'
import { ProductFilterQueryDto } from '../dto'
import { ProductSortField } from '../type'

export function GetProductListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve products',
      description: 'Retrieve paginated products with translated name and measurement base type',
    }),
    ApiResourceQuery<ProductFilterQueryDto, ProductSortField>({
      filter: {
        fields: {
          search: {
            description: 'Case-insensitive search by product name or slug',
            example: 'Potato',
          },
          measurementBaseType: {
            description:
              'Measurement base type of product. If undefined is passed, products with all types will be taken; otherwise, filtering will be performed based on the type value.',
            enum: MeasurementBaseTypeKey,
            example: MeasurementBaseTypeKey.MASS,
          },
        },
      },
      sort: {
        availableFields: PRODUCT_AVAILABLE_SORT_FIELDS,
      },
      pagination: {
        enabled: true,
      },
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Product list successfully retrieved',
      schema: successApiSchemaRef(PaginatedProductsApiModel),
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
        property: 'sort.field',
        value: 'unknown',
        constraints: {
          isIn: `Field sort.field must be one of the allowed values: ${PRODUCT_AVAILABLE_SORT_FIELDS.join(', ')}.`,
        },
      },
      {
        property: 'sort.order',
        value: 'invalid',
        constraints: {
          isEnum: `Field sort.order must be one of the allowed values: ${Object.values(SortOrder).join(', ')}.`,
        },
      },
      {
        property: 'pagination.page',
        value: 0,
        constraints: { min: 'Field pagination.page must not be less than 1.' },
      },
      {
        property: 'pagination.limit',
        value: 101,
        constraints: { min: 'Field pagination.limit must be less or equals to 100.' },
      },
      {
        property: 'pagination.limit',
        value: 0,
        constraints: { min: 'Field pagination.limit must not be less than 1.' },
      },
    ]),
  )
}
