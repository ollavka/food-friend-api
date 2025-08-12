import { ApiProperty } from '@nestjs/swagger'
import { ANY_DOCS_JSON } from '@swagger/constant'

export class HttpExceptionApiModel {
  @ApiProperty({ description: 'Exception type' })
  public type: string

  @ApiProperty({ description: 'HTTP status code' })
  public statusCode: number

  @ApiProperty({ description: 'Exception message' })
  public message: string

  @ApiProperty({ description: 'Exception details', oneOf: ANY_DOCS_JSON.oneOf, nullable: true })
  public details: unknown
}
