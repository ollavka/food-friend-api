import { ApiProperty } from '@nestjs/swagger'
import { IsJWT } from '@common/validation'

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google auth ID token (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO...',
    required: true,
  })
  @IsJWT()
  public idToken: string
}
