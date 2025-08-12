import { Nullable } from '@common/type'
import { ApiExceptionDetails } from './api-exception-details.type'

export type ApiExceptionResponseParams = {
  type?: Nullable<string>
  description?: Nullable<string>
  detailsModel?: Nullable<ApiExceptionDetails>
}
