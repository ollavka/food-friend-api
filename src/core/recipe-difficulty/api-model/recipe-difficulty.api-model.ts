import { ApiProperty } from '@nestjs/swagger'
import { RecipeDifficulty, RecipeDifficultyKey } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class RecipeDifficultyApiModel {
  @Expose()
  @ApiProperty({
    description: 'Recipe difficulty key',
    example: RecipeDifficultyKey.EASY,
    required: true,
  })
  public key: RecipeDifficultyKey

  @Expose()
  @ApiProperty({
    description: 'Recipe difficulty label',
    example: 'Easy',
    required: true,
  })
  public label: string

  public constructor(difficulty: Partial<RecipeDifficulty>) {
    Object.assign(this, difficulty)
  }

  public static from(difficulty: Partial<RecipeDifficulty>): RecipeDifficultyApiModel {
    return new this(difficulty)
  }

  public static fromList(difficulties: Array<Partial<RecipeDifficulty>>): RecipeDifficultyApiModel[] {
    return difficulties.map((difficulty) => this.from(difficulty))
  }
}
