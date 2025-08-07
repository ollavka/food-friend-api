import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User, UserRole } from '@prisma/client'
import { Request, Response } from 'express'
import { AppEntityNotFoundException } from '@common/exception'
import { convertToMs, hashValue, isDev } from '@common/util'
import { UserService } from '@core/user'
import { BcryptService } from '@infrastructure/cryptography/bcrypt'
import { JWT_ENV_CONFIG_KEY, JwtEnvConfig } from '../config/jwt'
import { LoginUserDto, RegisterUserDto } from '../dto'
import { JwtRepository } from '../repository'
import { SuccessAuthResponse } from '../type'

@Injectable()
export class AuthService {
  private readonly jwtEnvConfig: JwtEnvConfig

  public constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService<{ [JWT_ENV_CONFIG_KEY]: JwtEnvConfig }, true>,
    private readonly jwtRepository: JwtRepository,
  ) {
    this.jwtEnvConfig = configService.get(JWT_ENV_CONFIG_KEY)
  }

  public async register(res: Response, { password, ...userDto }: RegisterUserDto): Promise<SuccessAuthResponse> {
    const isUserExists = await this.userService.findByEmail(userDto.email, { select: { id: true } })

    if (isUserExists) {
      throw new ConflictException('This email address is already taken')
    }

    const hashedPassword = password ? await this.bcryptService.hash(password) : undefined

    const createdUser = await this.userService.create({
      ...userDto,
      password: hashedPassword,
      isVerified: false,
      role: UserRole.REGULAR,
      authMethod: AuthMethod.CREDENTIALS,
    })

    return this.auth(res, createdUser)
  }

  public async login(res: Response, { email, password }: LoginUserDto): Promise<SuccessAuthResponse> {
    const user = await this.userService.findByEmail(email, {
      select: { id: true, email: true, password: true, role: true },
    })

    if (!user || !user.password) {
      throw new BadRequestException('Invalid email or password')
    }

    const isPasswordsMatches = await this.bcryptService.compare(password, user.password)

    if (!isPasswordsMatches) {
      throw new BadRequestException('Invalid email or password')
    }

    return this.auth(res, user)
  }

  public async logout(req: Request, res: Response): Promise<boolean> {
    const refreshToken = req.cookies['refresh-token'] ?? ''
    const tokenHash = hashValue(refreshToken)

    if (refreshToken) {
      await this.jwtRepository.removeRefreshTokenByHash(tokenHash)
    }

    res.clearCookie('refresh-token')

    return true
  }

  public async refresh(req: Request, res: Response): Promise<SuccessAuthResponse> {
    const refreshToken = req.cookies['refresh-token'] ?? ''

    try {
      const payload = await this.jwtRepository.validateRefreshToken(refreshToken)
      const tokenHash = hashValue(refreshToken)
      const user = await this.userService.findById(payload.id, { select: { id: true, email: true, role: true } })

      if (!user) {
        throw new AppEntityNotFoundException('User not found', payload)
      }

      await this.jwtRepository.removeRefreshTokenByHash(tokenHash)
      return this.auth(res, user)
    } catch (err) {
      res.clearCookie('refresh-token')
      throw err
    }
  }

  private async auth(res: Response, user: User): Promise<SuccessAuthResponse> {
    const { jwtAccessTokenTtl, jwtRefreshTokenTtl } = this.jwtEnvConfig
    const { accessToken, refreshToken } = await this.jwtRepository.generateTokens(user, {
      jwtAccessTokenTtl,
      jwtRefreshTokenTtl,
    })

    this.setRefreshTokenCookie(res, refreshToken)

    return { accessToken }
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    const isDevEnv = isDev(this.configService)

    res.cookie('refresh-token', token, {
      httpOnly: true,
      sameSite: isDevEnv ? 'none' : 'lax',
      secure: !isDevEnv,
      maxAge: convertToMs(this.jwtEnvConfig.jwtRefreshTokenTtl),
    })
  }
}
