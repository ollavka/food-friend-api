import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { LoginUserDto, RegisterUserDto } from '../dto'
import { AuthService } from '../service'
import { SuccessAuthResponse } from '../type'

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Res({ passthrough: true }) res: Response,
    @Body() userDto: RegisterUserDto,
  ): Promise<SuccessAuthResponse> {
    return this.authService.register(res, userDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() userDto: LoginUserDto,
  ): Promise<SuccessAuthResponse> {
    return this.authService.login(res, userDto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<boolean> {
    return this.authService.logout(req, res)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<SuccessAuthResponse> {
    return this.authService.refresh(req, res)
  }
}
