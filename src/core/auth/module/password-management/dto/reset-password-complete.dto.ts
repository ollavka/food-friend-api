import { ApiProperty } from '@nestjs/swagger'
import { IsPassword, ToUuid } from '@common/validation'

export class ResetPasswordCompleteDto {
  @ToUuid()
  @ApiProperty({
    description: 'Reset password session ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public sessionId: string

  @IsPassword()
  @ApiProperty({ description: 'User password', example: 'Temp!234', minLength: 8, maxLength: 32, required: true })
  public newPassword: string
}
