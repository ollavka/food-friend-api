import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { LanguageService } from '@core/language'

@Injectable()
export class DefaultLanguageMiddleware implements NestMiddleware {
  public constructor(private readonly languageService: LanguageService) {}

  public async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const { code } = await this.languageService.getDefaultLanguage()
    req.defaultLanguageCode = code
    next()
  }
}
