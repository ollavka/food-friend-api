import { Nullable } from '@common/type'
import { ApiExceptionDetails } from './api-exception-details.type'

export type ApiHttpExceptionResponseVariant = {
  typeKey: string
  details?: Nullable<ApiExceptionDetails>
  messageOverride?: string
  summary?: string
  example?: unknown
}
