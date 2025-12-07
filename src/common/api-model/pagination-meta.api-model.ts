import { ApiProperty } from '@nestjs/swagger'
import { PaginationMeta } from '@common/type'

export class PaginationMetaApiModel implements PaginationMeta {
  @ApiProperty({ description: 'Total items count', example: 50, required: true })
  public totalItems: number

  @ApiProperty({ description: 'Current page number', example: 1, required: true })
  public page: number

  @ApiProperty({ description: 'Items per page', example: 10, required: true })
  public perPage: number

  @ApiProperty({ description: 'Total pages', example: 5, required: true })
  public pageCount: number

  @ApiProperty({ description: 'Has next page', example: true, required: true })
  public hasNextPage: boolean

  @ApiProperty({ description: 'Has previous page', example: false, required: true })
  public hasPrevPage: boolean
}
