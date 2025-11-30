import { LanguageCode } from '@prisma/client'
import { Nullable } from '@common/type'

export type HandleGoogleTokenType = {
  idToken: string
  userEmail: Nullable<string>
  languageCode: LanguageCode
}
