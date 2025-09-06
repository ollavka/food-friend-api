import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Response } from 'express'
import { AuthorizedUser } from '@common/decorator'
import { AccessTokenApiModel } from '../../../api-model'
import { OtpTicketApiModel } from '../api-model'
import { ConfirmEmailDto, SendVerificationMailDto } from '../dto'
import { EmailVerificationService } from '../service'

@ApiTags('Auth')
@Controller('auth/email/verification')
export class EmailVerificationController {
  public constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Post('request')
  @HttpCode(HttpStatus.ACCEPTED)
  public async sendVerificationMail(
    @Body() sendVerificationMailDto: SendVerificationMailDto,
  ): Promise<OtpTicketApiModel> {
    return this.emailVerificationService.sendVerificationMail(sendVerificationMailDto)
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  public async confirmEmail(
    @Res({ passthrough: true }) res: Response,
    @Body() confirmEmailDto: ConfirmEmailDto,
    @AuthorizedUser() user: User,
  ): Promise<AccessTokenApiModel | null> {
    return this.emailVerificationService.confirmEmail(res, confirmEmailDto, !user)
  }
}
