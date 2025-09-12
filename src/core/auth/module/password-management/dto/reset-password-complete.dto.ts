import { ApiProperty } from '@nestjs/swagger'
import { IsPassword, ToUuid } from '@common/validation'

export class ResetPasswordCompleteDto {
  @ToUuid()
  @ApiProperty({
    description: 'OTP Ticket',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public ticket: string

  @IsPassword()
  @ApiProperty({ description: 'User password', example: 'New!2345', minLength: 8, maxLength: 32, required: true })
  public newPassword: string
}
