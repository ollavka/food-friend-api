import { OtpCode } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { ToId } from '@common/validation'

@Exclude()
export class OtpTicketApiModel {
  @Expose()
  @ToId()
  public ticket: string

  public constructor(otp: OtpCode) {
    this.ticket = otp.id
  }

  public static from(otp: OtpCode): OtpTicketApiModel {
    return new this(otp)
  }
}
