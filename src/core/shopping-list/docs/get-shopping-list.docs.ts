import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ShoppingListStatus } from '@prisma/client'
import { SortOrder } from '@common/enum'
import {
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiResourceQuery,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { PaginatedShoppingListsApiModel } from '../api-model'
import { SHOPPING_LIST_AVAILABLE_SORT_FIELDS } from '../constant'
import { ShoppingListFilterQueryDto } from '../dto'
import { ShoppingListSortField } from '../type'

export function GetShoppingListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve shopping lists',
      description: 'Retrieve paginated shopping lists of current user',
    }),
    ApiResourceQuery<ShoppingListFilterQueryDto, ShoppingListSortField>({
      filter: {
        fields: {
          status: {
            description:
              'Shopping list status filter. If undefined is passed, only active shopping lists will be returned.',
            enum: ShoppingListStatus,
            example: ShoppingListStatus.ACTIVE,
          },
        },
      },
      sort: {
        availableFields: SHOPPING_LIST_AVAILABLE_SORT_FIELDS,
      },
      pagination: {
        enabled: true,
      },
    }),
    ApiOkResponse({
      description: 'Shopping list successfully retrieved',
      schema: successApiSchemaRef(PaginatedShoppingListsApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'filter.status',
        value: 'INVALID_STATUS',
        constraints: {
          isEnum: `Field filter.status must be one of the allowed values: ${Object.values(ShoppingListStatus).join(', ')}.`,
        },
      },
      {
        property: 'sort.field',
        value: 'unknown',
        constraints: {
          isIn: `Field sort.field must be one of the allowed values: ${SHOPPING_LIST_AVAILABLE_SORT_FIELDS.join(', ')}.`,
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
