import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { addMilliseconds, isBefore } from 'date-fns'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { DurationString } from '@common/type'
import { convertToMs, hashValue } from '@common/util'
import { PrismaService } from '@infrastructure/database'
import { JwtEnvConfig } from '../config/jwt'
import { AuthTokens, JwtUserPayload } from '../type'

@Injectable()
export class JwtRepository {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async removeRefreshTokenById(tokenId: string): Promise<boolean> {
    await this.prismaService.refreshToken.deleteMany({ where: { id: tokenId } })
    return true
  }

  public async removeRefreshTokenByHash(tokenHash: string): Promise<boolean> {
    await this.prismaService.refreshToken.deleteMany({ where: { tokenHash } })
    return true
  }

  public async removeRefreshTokenByUserId(userId: string): Promise<boolean> {
    await this.prismaService.refreshToken.deleteMany({ where: { userId } })
    return true
  }

  public async validateRefreshToken(token: string): Promise<JwtUserPayload> {
    const tokenHash = hashValue(token)

    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    })

    if (!refreshToken) {
      throw new AccessControlAuthenticationException('not-found-token', 'Refresh token does not exist.')
    }

    const isTokenExpired = isBefore(refreshToken.expiresAt, new Date())

    if (isTokenExpired) {
      throw new AccessControlAuthenticationException('expired-token', 'Refresh token is expired.')
    }

    const payload = this.jwtService.verify<JwtUserPayload>(token)

    if (!payload) {
      throw new AccessControlAuthenticationException('invalid-token', 'Invalid refresh token.')
    }

    return payload
  }

  public async saveRefreshToken(token: string, userId: string, tokenTtl: DurationString): Promise<void> {
    const tokenHash = hashValue(token)
    const expiresAt = addMilliseconds(new Date(), convertToMs(tokenTtl))

    await this.prismaService.refreshToken.create({
      data: {
        user: {
          connect: { id: userId },
        },
        tokenHash,
        expiresAt,
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

  public async generateTokens(user: User, jwtOptions: Omit<JwtEnvConfig, 'jwtSecretKey'>): Promise<AuthTokens> {
    const { jwtAccessTokenTtl, jwtRefreshTokenTtl } = jwtOptions

    const accessToken = this.generateToken(user, jwtAccessTokenTtl)
    const refreshToken = this.generateToken(user, jwtRefreshTokenTtl)

    await this.saveRefreshToken(refreshToken, user.id, jwtRefreshTokenTtl)

    return {
      accessToken,
      refreshToken,
    }
  }
}
