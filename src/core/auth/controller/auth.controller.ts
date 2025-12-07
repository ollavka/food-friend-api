import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Authorization } from '@access-control/decorator'
import { OtpTicketApiModel, SuccessAuthApiModel } from '../api-model'
import { LoginDocs, LogoutDocs, RefreshDocs } from '../docs'
import { RegisterDocs } from '../docs/register.docs'
import { LoginUserDto, RegisterUserDto } from '../dto'
import { AuthService } from '../service'

@ApiTags('Auth')
@ApiExtraModels(SuccessAuthApiModel, OtpTicketApiModel)
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterDocs()
  public async register(@Body() userDto: RegisterUserDto): Promise<OtpTicketApiModel> {
    return this.authService.register(userDto)
  }

  @Post('login')
  @LoginDocs()
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() userDto: LoginUserDto,
  ): Promise<SuccessAuthApiModel> {
    return this.authService.login(res, userDto)
  }

  @Post('logout')
  @Authorization()
  @LogoutDocs()
  public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<null> {
    return this.authService.logout(req, res)
  }

  @Post('refresh')
  @RefreshDocs()
  public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<SuccessAuthApiModel> {
    return this.authService.refresh(req, res)
  }
}
