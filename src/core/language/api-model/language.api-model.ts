import { ApiProperty } from '@nestjs/swagger'
import { Language, LanguageCode } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class LanguageApiModel {
  @Expose()
  @ApiProperty({
    description: 'Language code',
    example: 'EN',
    required: true,
  })
  public code: LanguageCode

  @Expose()
  @ApiProperty({
    description: 'Language locale',
    example: 'en_US',
    required: true,
  })
  public locale: string

  @Expose()
  @ApiProperty({
    description: 'Language full label',
    example: 'English',
    required: true,
  })
  public fullLabel: string

  @Expose()
  @ApiProperty({
    description: 'Language short label',
    example: 'Eng',
    required: true,
  })
  public shortLabel: string

  public constructor(language: Partial<Language>) {
    Object.assign(this, language)
  }

  public static from(language: Partial<Language>): LanguageApiModel {
    return new this(language)
  }

  public static fromList(languages: Array<Partial<Language>>): LanguageApiModel[] {
    return languages.map((language) => this.from(language))
  }
}
