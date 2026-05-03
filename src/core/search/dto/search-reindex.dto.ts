import { ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsOptional } from 'class-validator'
import { IsEnum } from '@common/validation'

export enum SearchReindexEntity {
  PRODUCTS = 'PRODUCTS',
  RECIPES = 'RECIPES',
}

export class SearchReindexDto {
  @ApiPropertyOptional({
    description: 'Entity groups to reindex. If omitted, both products and recipes are reindexed.',
    enum: SearchReindexEntity,
    isArray: true,
    example: [SearchReindexEntity.PRODUCTS, SearchReindexEntity.RECIPES],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(SearchReindexEntity, { each: true })
  public entities?: SearchReindexEntity[]
}
