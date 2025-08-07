import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppEntityNotFoundException } from '@common/exception'
import { isDev } from '@common/util'
import { UserService } from '@core/user'
import { JWT_ENV_CONFIG_KEY, JwtEnvConfig } from '../config/jwt'
import { JwtUserPayload } from '../type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    private readonly configService: ConfigService<{ [JWT_ENV_CONFIG_KEY]: JwtEnvConfig }, true>,
    private readonly userService: UserService,
  ) {
    const { jwtSecretKey } = configService.get<JwtEnvConfig>(JWT_ENV_CONFIG_KEY)

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecretKey,
      algorithms: ['HS256'],
    })
  }

  public async validate(payload: JwtUserPayload): Promise<User> {
    const user = await this.userService.findById(payload.id)

    if (!user) {
      throw AppEntityNotFoundException.byId('User', payload.id)
    }

    if (!isDev(this.configService) && !user.isVerified) {
      throw new UnauthorizedException('Email not confirmed')
    }

    return user
  }
}
