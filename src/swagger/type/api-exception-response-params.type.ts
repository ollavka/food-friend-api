import { Nullable } from '@common/type'
import { ApiExceptionDetails } from './api-exception-details.type'
import { ApiHttpExceptionResponseVariant } from './api-http-exception-response-variant.type'

export type ApiExceptionResponseParams = {
  type?: Nullable<string>
  description?: Nullable<string>
  details?: Nullable<ApiExceptionDetails>
  variants?: Array<ApiHttpExceptionResponseVariant>
}
