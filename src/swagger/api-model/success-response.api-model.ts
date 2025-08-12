import { ApiProperty } from '@nestjs/swagger'
import { ANY_DOCS_JSON } from '@swagger/constant'

export class SuccessResponseApiModel<TData = unknown> {
  @ApiProperty({ description: 'Response status', enum: ['success'] })
  public status: 'success'

  @ApiProperty({ oneOf: ANY_DOCS_JSON.oneOf, nullable: true, description: 'Response data' })
  public data: TData
}
