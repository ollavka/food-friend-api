import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Response } from 'express'
import { SuccessMessageApiModel } from '@common/api-model'
import { AuthorizedUser } from '@common/decorator'
import { ConfirmOtpCodeDto } from '@common/dto'
import { AccessTokenApiModel, OtpTicketApiModel } from '@core/auth/api-model'
import { ConfirmEmailDocs, RequestMailDocs } from '../docs'
import { SendVerificationMailDto } from '../dto'
import { EmailVerificationService } from '../service'

@ApiTags('Email verification')
@Controller('auth/email/verification')
@ApiExtraModels(AccessTokenApiModel, SuccessMessageApiModel, OtpTicketApiModel)
export class EmailVerificationController {
  public constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Post('request')
  @HttpCode(HttpStatus.ACCEPTED)
  @RequestMailDocs()
  public async sendVerificationMail(@Body() { email }: SendVerificationMailDto): Promise<OtpTicketApiModel> {
    return this.emailVerificationService.sendVerificationMail(email)
  }

  @Post('confirm')
  @ConfirmEmailDocs()
  public async confirmEmail(
    @Res({ passthrough: true }) res: Response,
    @Body() confirmOtpCodeDto: ConfirmOtpCodeDto,
    @AuthorizedUser() user: User,
  ): Promise<AccessTokenApiModel | SuccessMessageApiModel> {
    const accessTokenApiModel = await this.emailVerificationService.confirmEmail(res, confirmOtpCodeDto, !user)
    return accessTokenApiModel ?? { message: 'The email has been successfully confirmed.' }
  }
}
