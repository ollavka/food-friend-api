import { ApiProperty } from '@nestjs/swagger'

export class AuthTokensApiModel {
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
  public refreshToken: string
}
