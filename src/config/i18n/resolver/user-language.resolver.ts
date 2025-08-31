import { ExecutionContext, Injectable } from '@nestjs/common'
import { I18nResolver } from 'nestjs-i18n'

@Injectable()
export class UserLanguageResolver implements I18nResolver {
  public async resolve(_context: ExecutionContext): Promise<string | undefined> {
    // const req = context.switchToHttp().getRequest() as Request
    // return req.user?.language
    return
  }
}
