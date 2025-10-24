import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { StatusPolicy } from '@access-control/util'
import { AppEntityNotFoundException } from '@common/exception'
import { convertToMs, hashValue, isDev } from '@common/util'
import { AccessTokenApiModel } from '@core/auth/api-model'
import { JWT_ENV_CONFIG_KEY, JwtEnvConfig } from '@core/auth/config/jwt'
import { UserService } from '@core/user'
import { SessionRepository } from '../repository'

@Injectable()
export class AuthSessionService {
  private readonly jwtEnvConfig: JwtEnvConfig

  public constructor(
    private readonly userService: UserService,
    private readonly sessionRepository: SessionRepository,
    configService: ConfigService<{ [JWT_ENV_CONFIG_KEY]: JwtEnvConfig }, true>,
  ) {
    this.jwtEnvConfig = configService.get(JWT_ENV_CONFIG_KEY)
  }

  public async refresh(req: Request, res: Response): Promise<AccessTokenApiModel> {
    const refreshToken = req.cookies['refresh-token'] ?? ''

    try {
      const payload = await this.sessionRepository.validateRefreshToken(refreshToken)
      const user = await this.userService.findById(payload.id)

      if (!user) {
        throw new AppEntityNotFoundException('User', payload)
      }

      return this.auth(res, user)
    } catch (err) {
      res.clearCookie('refresh-token')
      throw err
    }
  }

  public async logout(req: Request, res: Response): Promise<null> {
    const refreshToken = req.cookies['refresh-token'] ?? ''
    const tokenHash = hashValue(refreshToken)

    if (refreshToken) {
      await this.sessionRepository.removeRefreshTokenByHash(tokenHash)
    }

    res.clearCookie('refresh-token')
    return null
  }

  public async auth(res: Response, user: User): Promise<AccessTokenApiModel> {
    await StatusPolicy.enforce(user)

    const { jwtAccessTokenTtl, jwtRefreshTokenTtl } = this.jwtEnvConfig
    const { accessToken, refreshToken } = await this.sessionRepository.generateTokens(user, {
      jwtAccessTokenTtl,
      jwtRefreshTokenTtl,
    })

    await this.sessionRepository.saveRefreshToken(refreshToken, user.id, jwtRefreshTokenTtl)

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
