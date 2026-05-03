import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { RecipeAuthor } from '../type'

@Exclude()
export class RecipeAuthorApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Author ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ApiProperty({ description: 'Author first name', example: 'John', required: false, nullable: true })
  public firstName: string | null

  @Expose()
  @ApiProperty({ description: 'Author last name', example: 'Doe', required: false, nullable: true })
  public lastName: string | null

  public constructor(author: RecipeAuthor) {
    Object.assign(this, author)
  }

  public static from(author: RecipeAuthor): RecipeAuthorApiModel {
    return new this(author)
  }
}
