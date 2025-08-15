import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AccessTokenApiModel } from '../api-model'
import { LoginDocs, LogoutDocs, RefreshDocs } from '../docs'
import { RegisterDocs } from '../docs/register.docs'
import { LoginUserDto, RegisterUserDto } from '../dto'
import { OtpTicketApiModel } from '../email-verification/api-model'
import { AuthService } from '../service'

@ApiTags('Auth')
@ApiExtraModels(AccessTokenApiModel)
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterDocs()
  public async register(
    @Res({ passthrough: true }) res: Response,
    @Body() userDto: RegisterUserDto,
  ): Promise<OtpTicketApiModel> {
    return this.authService.register(res, userDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginDocs()
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() userDto: LoginUserDto,
  ): Promise<AccessTokenApiModel> {
    return this.authService.login(res, userDto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutDocs()
  public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<boolean> {
    return this.authService.logout(req, res)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @RefreshDocs()
  public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AccessTokenApiModel> {
    return this.authService.refresh(req, res)
  }
}
