import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User, UserRole, UserStatus } from '@prisma/client'
import { Request, Response } from 'express'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { StatusPolicy } from '@access-control/util'
import { AppConflictException, AppEntityNotFoundException } from '@common/exception'
import { convertToMs, hashValue, isDev } from '@common/util'
import { UserService } from '@core/user'
import { BcryptService } from '@infrastructure/cryptography/bcrypt'
import { AccessTokenApiModel } from '../api-model'
import { JWT_ENV_CONFIG_KEY, JwtEnvConfig } from '../config/jwt'
import { LoginUserDto, RegisterUserDto } from '../dto'
import { EmailVerificationService } from '../email-verification'
import { OtpTicketApiModel } from '../email-verification/api-model'
import { JwtRepository } from '../repository'

@Injectable()
export class AuthService {
  private readonly jwtEnvConfig: JwtEnvConfig

  public constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService<{ [JWT_ENV_CONFIG_KEY]: JwtEnvConfig }, true>,
    private readonly jwtRepository: JwtRepository,
    @Inject(forwardRef(() => EmailVerificationService))
    private readonly emailVerificationService: EmailVerificationService,
  ) {
    this.jwtEnvConfig = configService.get(JWT_ENV_CONFIG_KEY)
  }

  public async register(res: Response, { password, ...userDto }: RegisterUserDto): Promise<OtpTicketApiModel> {
    const isUserExists = await this.userService.findByEmail(userDto.email, { select: { id: true } })

    if (isUserExists) {
      throw new AppConflictException('email-taken', 'This email address is already taken.')
    }

    const hashedPassword = password ? await this.bcryptService.hash(password) : undefined

    const createdUser = await this.userService.create({
      ...userDto,
      password: hashedPassword,
      status: UserStatus.UNVERIFIED,
      role: UserRole.REGULAR,
      authMethod: AuthMethod.CREDENTIALS,
    })

    return this.emailVerificationService.sendVerificationMail(
      { email: createdUser.email, userName: createdUser.firstName },
      false,
    )
  }

  public async login(res: Response, { email, password }: LoginUserDto): Promise<AccessTokenApiModel> {
    const user = await this.userService.findByEmail(email)

    if (!user || !user.password) {
      throw new AccessControlAuthenticationException('credentials', 'Invalid credentials.')
    }

    const isPasswordsMatches = await this.bcryptService.compare(password, user.password)

    if (!isPasswordsMatches) {
      throw new AccessControlAuthenticationException('credentials', 'Invalid credentials.')
    }

    return this.auth(res, user)
  }

  public async logout(req: Request, res: Response): Promise<null> {
    const refreshToken = req.cookies['refresh-token'] ?? ''
    const tokenHash = hashValue(refreshToken)

    if (refreshToken) {
      await this.jwtRepository.removeRefreshTokenByHash(tokenHash)
    }

    res.clearCookie('refresh-token')

    return null
  }

  public async refresh(req: Request, res: Response): Promise<AccessTokenApiModel> {
    const refreshToken = req.cookies['refresh-token'] ?? ''

    try {
      const payload = await this.jwtRepository.validateRefreshToken(refreshToken)
      const tokenHash = hashValue(refreshToken)
      const user = await this.userService.findById(payload.id, { omit: { password: true } })

      if (!user) {
        throw new AppEntityNotFoundException('User', payload)
      }

      await this.jwtRepository.removeRefreshTokenByHash(tokenHash)
      return this.auth(res, user)
    } catch (err) {
      res.clearCookie('refresh-token')
      throw err
    }
  }

  public async auth(res: Response, user: User): Promise<AccessTokenApiModel> {
    await StatusPolicy.enforce(user)

    const { jwtAccessTokenTtl, jwtRefreshTokenTtl } = this.jwtEnvConfig
    const { accessToken, refreshToken } = await this.jwtRepository.generateTokens(user, {
      jwtAccessTokenTtl,
      jwtRefreshTokenTtl,
    })

    this.setRefreshTokenCookie(res, refreshToken)

    return { accessToken }
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    const isDevEnv = isDev()

    res.cookie('refresh-token', token, {
      httpOnly: true,
      sameSite: isDevEnv ? 'none' : 'lax',
      secure: !isDevEnv,
      maxAge: convertToMs(this.jwtEnvConfig.jwtRefreshTokenTtl),
    })
  }
}
