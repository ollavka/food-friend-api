import { Body, Controller, Post, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LanguageCode, User } from '@prisma/client'
import { Response } from 'express'
import { Authorization } from '@access-control/decorator'
import { SuccessMessageApiModel } from '@common/api-model'
import { AuthUser, Language } from '@common/decorator'
import { AccessTokenApiModel } from '@core/auth/api-model'
import { LocalizationFactory } from '@localization'
import { GoogleAuthDocs, LinkGoogleAccountDocs, UnlinkGoogleAccountDocs } from '../docs'
import { GoogleAuthDto } from '../dto'
import { GoogleProviderService } from '../service'

@ApiTags('Google auth')
@Controller('auth/google')
export class GoogleProviderController {
  public constructor(
    private readonly googleProviderService: GoogleProviderService,
    private readonly localizationFactory: LocalizationFactory,
  ) {}

  @Post()
  @GoogleAuthDocs()
  public async googleAuth(
    @Res({ passthrough: true }) res: Response,
    @Body() { idToken }: GoogleAuthDto,
    @Language() languageCode: LanguageCode,
  ): Promise<AccessTokenApiModel> {
    return this.googleProviderService.googleAuth(res, idToken, languageCode)
  }

  @Authorization()
  @Post('link')
  @LinkGoogleAccountDocs()
  public async linkGoogleAccount(
    @AuthUser() user: User,
    @Body() { idToken }: GoogleAuthDto,
    @Language() languageCode: LanguageCode,
  ): Promise<SuccessMessageApiModel> {
    await this.googleProviderService.linkGoogleAccount(idToken, user.email, languageCode)
    const t = this.localizationFactory.createFor('success-message')
    return { message: t('google-account.linked') }
  }

  @Authorization()
  @Post('unlink')
  @UnlinkGoogleAccountDocs()
  public async unlinkGoogleAccount(@AuthUser() user: User): Promise<SuccessMessageApiModel> {
    await this.googleProviderService.unlinkGoogleAccount(user.id)
    const t = this.localizationFactory.createFor('success-message')
    return { message: t('google-account.unlinked') }
  }
}
