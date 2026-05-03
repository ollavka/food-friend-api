import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'

type SearchRecipeAuthor = {
  id: string
  firstName: string | null
  lastName: string | null
}

@Exclude()
export class SearchRecipeAuthorApiModel {
  @Expose()
  @ToId()
  @ApiProperty({
    description: 'Recipe author ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public id: Hash

  @Expose()
  @ApiProperty({
    description: 'Recipe author first name',
    example: 'John',
    required: false,
    nullable: true,
  })
  public firstName: string | null

  @Expose()
  @ApiProperty({
    description: 'Recipe author last name',
    example: 'Doe',
    required: false,
    nullable: true,
  })
  public lastName: string | null

  public constructor(author: SearchRecipeAuthor) {
    Object.assign(this, author)
  }

  public static from(author: SearchRecipeAuthor): SearchRecipeAuthorApiModel {
    return new this(author)
  }
}
