import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from '@common/validation'

export class RecipeStepInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Recipe step content',
    example: 'Boil water and add pasta.',
    required: true,
  })
  public content: string
}
