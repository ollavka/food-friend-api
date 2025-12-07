import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class AuthTokensApiModel {
  @Expose()
  @ApiProperty({
    description: 'Access JWT token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO...',
    required: true,
  })
  public accessToken: string

  @ApiProperty({
    description: 'Refresh JWT token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO...',
    required: true,
  })
  @Expose()
  public refreshToken: string
}
