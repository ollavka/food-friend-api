import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { RecipeStep } from '../type'

@Exclude()
export class RecipeStepApiModel {
  @Expose()
  @ApiProperty({ description: 'Step order', example: 1, required: true })
  public sortOrder: number

  @Expose()
  @ApiProperty({ description: 'Step content', example: 'Boil water and add pasta.', required: true })
  public content: string

  public constructor(step: RecipeStep) {
    Object.assign(this, step)
  }

  public static from(step: RecipeStep): RecipeStepApiModel {
    return new this(step)
  }

  public static fromList(steps: RecipeStep[]): RecipeStepApiModel[] {
    return steps.map((step) => this.from(step))
  }
}
