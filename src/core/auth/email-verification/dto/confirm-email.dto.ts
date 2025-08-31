import { IsNotEmpty } from 'class-validator'
import { IsOTPCode, ToUuid } from '@common/validation'

export class ConfirmEmailDto {
  @IsNotEmpty()
  @ToUuid()
  public ticket: string

  @IsOTPCode()
  public code: string
}
