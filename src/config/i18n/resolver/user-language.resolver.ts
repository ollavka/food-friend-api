import { ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { I18nResolver } from 'nestjs-i18n'

@Injectable()
export class UserLanguageResolver implements I18nResolver {
  public async resolve(context: ExecutionContext): Promise<string | undefined> {
    const req = context.switchToHttp().getRequest() as Request
    const user = req?.user

    if (user?.languageCode) {
      return user.languageCode
    }
  }
}
