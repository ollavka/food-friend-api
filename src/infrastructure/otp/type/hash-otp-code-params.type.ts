import { OtpCodeType } from '@prisma/client'

export type HashOtpCodeParams = {
  identity: string
  scope: OtpCodeType
}
