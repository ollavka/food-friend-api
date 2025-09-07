import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { IsOTPCode, ToUuid } from '@common/validation'

export class ConfirmOtpCodeDto {
  @IsNotEmpty()
  @ToUuid()
  @ApiProperty({
    description: 'OTP Ticket',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public ticket: string

  @IsOTPCode()
  @ApiProperty({
    description: 'OTP Code',
    example: '451957',
    required: true,
  })
  public code: string
}
