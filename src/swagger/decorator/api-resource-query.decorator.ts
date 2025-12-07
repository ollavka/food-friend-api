import { applyDecorators } from '@nestjs/common'
import { ApiQuery, type ApiQueryOptions } from '@nestjs/swagger'
import { SortOrder } from '@common/enum'

type ApiResourceQueryDocsParams<Filter = never, SortField extends string = string> = {
  filter?: {
    fields: Partial<Record<keyof Filter & string, ApiQueryOptions>>
  }
  sort?: {
    availableFields: readonly SortField[]
    fieldDescription?: string
    orderDescription?: string
  }
  pagination?: {
    enabled?: boolean
    pageDescription?: string
    limitDescription?: string
  }
}

export function ApiResourceQuery<Filter = never, SortField extends string = string>(
  params: ApiResourceQueryDocsParams<Filter, SortField>,
): MethodDecorator {
  const decorators: MethodDecorator[] = []

  // ---- FILTER ----
  if (params.filter?.fields) {
    const filterFields = params.filter.fields

    for (const fieldKey in filterFields) {
      const options = filterFields[fieldKey]
      if (!options) {
        continue
      }

      const name = `filter[${fieldKey}]`

      decorators.push(
        ApiQuery({
          name,
          required: false,
          ...options,
        }),
      )
    }
  }

  // ---- SORT ----
  if (params.sort?.availableFields?.length) {
    decorators.push(
      ApiQuery({
        name: 'sort[field]',
        required: false,
        description: params.sort?.fieldDescription ?? 'Field name to sort by',
        schema: {
          type: 'string',
          enum: params.sort.availableFields as SortField[],
        },
      }),
      ApiQuery({
        name: 'sort[order]',
        required: false,
        description: params.sort?.orderDescription ?? 'Sort order (asc or desc)',
        schema: {
          type: 'string',
          enum: [SortOrder.Ascending, SortOrder.Descending],
          default: SortOrder.Ascending,
        },
      }),
    )
  }

  // ---- PAGINATION ----
  if (params.pagination?.enabled) {
    decorators.push(
      ApiQuery({
        name: 'pagination[page]',
        required: false,
        description: params.pagination.pageDescription ?? 'Page number',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      }),
      ApiQuery({
        name: 'pagination[limit]',
        required: false,
        description: params.pagination.limitDescription ?? 'Resources count per page',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 10,
        },
      }),
    )
  }

  return applyDecorators(...decorators)
}
