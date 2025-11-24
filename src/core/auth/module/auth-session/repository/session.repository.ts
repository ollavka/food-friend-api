import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { addMilliseconds, isBefore } from 'date-fns'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { DurationString } from '@common/type'
import { convertToMs, hashValue } from '@common/util'
import { AuthTokensApiModel } from '@core/auth/api-model'
import { JwtEnvConfig } from '@core/auth/config/jwt'
import { JwtUserPayload } from '@core/auth/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class SessionRepository {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async removeRefreshTokenById(tokenId: string): Promise<boolean> {
    await this.prismaService.session.deleteMany({ where: { id: tokenId } })
    return true
  }

  public async removeRefreshTokenByHash(tokenHash: string): Promise<boolean> {
    await this.prismaService.session.deleteMany({ where: { tokenHash } })
    return true
  }

  public async removeRefreshTokenByUserId(userId: string): Promise<boolean> {
    await this.prismaService.session.deleteMany({ where: { userId } })
    return true
  }

  public async validateRefreshToken(token: string): Promise<JwtUserPayload> {
    const tokenHash = hashValue(token)

    const refreshToken = await this.prismaService.session.findUnique({
      where: {
        tokenHash,
      },
    })

    if (!refreshToken) {
      throw new AccessControlAuthenticationException('refresh-token-not-found', 'Refresh token does not exist.')
    }

    const isTokenExpired = isBefore(refreshToken.expiresAt, new Date())

    if (isTokenExpired) {
      throw new AccessControlAuthenticationException('refresh-token-expired', 'Refresh token is expired.')
    }

    const payload = this.jwtService.verify<JwtUserPayload>(token)

    if (!payload?.id) {
      throw new AccessControlAuthenticationException('refresh-token-invalid', 'Invalid refresh token.')
    }

    return payload
  }

  public async saveRefreshToken(token: string, userId: string, tokenTtl: DurationString): Promise<void> {
    const tokenHash = hashValue(token)
    const expiresAt = addMilliseconds(new Date(), convertToMs(tokenTtl))

    await this.removeRefreshTokenByUserId(userId)

    await this.prismaService.session.create({
      data: {
        expiresAt,
        tokenHash,
        isRevoked: false,
        user: {
          connect: { id: userId },
        },
      },
    })
  }

  public generateToken(user: User, expiresIn: DurationString): string {
    const payload: JwtUserPayload = {
      id: user.id,
    }

    const token = this.jwtService.sign(payload, {
      expiresIn,
    })

    return token
  }

  public async generateTokens(user: User, jwtOptions: Omit<JwtEnvConfig, 'jwtSecretKey'>): Promise<AuthTokensApiModel> {
    const { jwtAccessTokenTtl, jwtRefreshTokenTtl } = jwtOptions

    const accessToken = this.generateToken(user, jwtAccessTokenTtl)
    const refreshToken = this.generateToken(user, jwtRefreshTokenTtl)

    return {
      accessToken,
      refreshToken,
    }
  }
}
