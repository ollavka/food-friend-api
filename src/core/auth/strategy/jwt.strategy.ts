import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { LanguageCode, User } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppEntityNotFoundException } from '@common/exception'
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

  public async validate(payload: JwtUserPayload): Promise<User & { languageCode?: LanguageCode }> {
    const user = await this.userService.findById(payload.id, {
      include: {
        language: {
          select: { code: true },
        },
      },
    })

    if (!user) {
      throw AppEntityNotFoundException.byId('User', payload.id)
    }

    const { language, ...userData } = user

    return {
      ...userData,
      languageCode: language?.code,
    }
  }
}
