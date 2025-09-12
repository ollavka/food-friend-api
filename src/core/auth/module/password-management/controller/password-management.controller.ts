import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { SuccessMessageApiModel } from '@common/api-model'
import { AuthorizedUser } from '@common/decorator'
import { ConfirmOtpCodeDto } from '@common/dto'
import { OtpTicketApiModel } from '@core/auth/api-model'
import {
  ChangePasswordDocs,
  ResetPasswordCompleteDocs,
  ResetPasswordConfirmDocs,
  ResetPasswordRequestDocs,
  SetPasswordDocs,
} from '../docs'
import { ChangePasswordDto, ResetPasswordCompleteDto, ResetPasswordDto, SetPasswordDto } from '../dto'
import { PasswordManagementService } from '../service'

@ApiTags('Password management')
@Controller('auth/password')
@ApiExtraModels(SuccessMessageApiModel, OtpTicketApiModel)
export class PasswordManagementController {
  public constructor(private readonly passwordManagementService: PasswordManagementService) {}

  @Post('reset/request')
  @HttpCode(HttpStatus.ACCEPTED)
  @ResetPasswordRequestDocs()
  public async resetPassword(@Body() { email }: ResetPasswordDto): Promise<OtpTicketApiModel> {
    return this.passwordManagementService.sendResetPasswordMail(email)
  }

  @Post('reset/confirm')
  @ResetPasswordConfirmDocs()
  public async confirmResetPassword(@Body() confirmOtpCodeDto: ConfirmOtpCodeDto): Promise<OtpTicketApiModel> {
    return this.passwordManagementService.confirmResetPassword(confirmOtpCodeDto)
  }

  @Post('reset/complete')
  @ResetPasswordCompleteDocs()
  public async completeResetPassword(
    @Body() resetPasswordCompleteDto: ResetPasswordCompleteDto,
  ): Promise<SuccessMessageApiModel> {
    await this.passwordManagementService.completeResetPassword(resetPasswordCompleteDto)
    return { message: 'The password has been successfully reset.' }
  }

  @Post('set')
  @Authorization()
  @SetPasswordDocs()
  public async setPassword(
    @AuthorizedUser() user: User,
    @Body() { password }: SetPasswordDto,
  ): Promise<SuccessMessageApiModel> {
    await this.passwordManagementService.setPassword(user, password)
    return { message: 'The password has been successfully set.' }
  }

  @Post('change')
  @Authorization()
  @ChangePasswordDocs()
  public async changePassword(
    @AuthorizedUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<SuccessMessageApiModel> {
    await this.passwordManagementService.changePassword(user, changePasswordDto)
    return { message: 'The password has been successfully changed.' }
  }
}
