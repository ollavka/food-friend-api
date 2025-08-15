import { IsNotEmpty, IsNumberString } from 'class-validator'
import { ToUuid } from '@common/validation'

export class ConfirmEmailDto {
  @IsNotEmpty()
  @ToUuid()
  public ticket: string

  @IsNotEmpty()
  @IsNumberString()
  public code: string
}
