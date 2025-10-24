import { Body, Controller, Post, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Response } from 'express'
import { Authorization } from '@access-control/decorator'
import { SuccessMessageApiModel } from '@common/api-model'
import { AuthorizedUser } from '@common/decorator'
import { AccessTokenApiModel } from '@core/auth/api-model'
import { GoogleAuthDocs, LinkGoogleAccountDocs, UnlinkGoogleAccountDocs } from '../docs'
import { GoogleAuthDto } from '../dto'
import { GoogleProviderService } from '../service'

@ApiTags('Google auth')
@Controller('auth/google')
export class GoogleProviderController {
  public constructor(private readonly googleProviderService: GoogleProviderService) {}

  @Post()
  @GoogleAuthDocs()
  public async googleAuth(
    @Res({ passthrough: true }) res: Response,
    @Body() { idToken }: GoogleAuthDto,
  ): Promise<AccessTokenApiModel> {
    return this.googleProviderService.googleAuth(res, idToken)
  }

  @Authorization()
  @Post('link')
  @LinkGoogleAccountDocs()
  public async linkGoogleAccount(
    @AuthorizedUser() user: User,
    @Body() { idToken }: GoogleAuthDto,
  ): Promise<SuccessMessageApiModel> {
    await this.googleProviderService.linkGoogleAccount(idToken, user.email)
    return { message: 'Google account has been successfully linked to your account.' }
  }

  @Authorization()
  @Post('unlink')
  @UnlinkGoogleAccountDocs()
  public async unlinkGoogleAccount(@AuthorizedUser() user: User): Promise<SuccessMessageApiModel> {
    await this.googleProviderService.unlinkGoogleAccount(user.id)
    return { message: 'Google account has been successfully unlinked from your account.' }
  }
}
