import { OtpCode } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import { ToId } from '@common/validation'

@Exclude()
export class OtpTicketApiModel {
  @Expose()
  @IsNotEmpty()
  @ToId()
  public ticket: string

  public constructor(otp: OtpCode) {
    this.ticket = otp.id
  }

  public static from(otp: OtpCode): OtpTicketApiModel {
    return new this(otp)
  }
}
