import { ApiProperty } from '@nestjs/swagger'
import { OtpCode } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'

@Exclude()
export class OtpTicketApiModel {
  @Expose()
  @ToId()
  @ApiProperty({
    description: 'OTP Ticket',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public ticket: Hash

  public constructor(otp: OtpCode) {
    this.ticket = otp.id
  }

  public static from(otp: OtpCode): OtpTicketApiModel {
    return new this(otp)
  }
}
