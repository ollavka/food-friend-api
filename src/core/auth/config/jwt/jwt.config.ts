import { ConfigModule, ConfigType, getConfigToken, registerAs } from '@nestjs/config'
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt'
import { DurationString } from '@common/type'
import { JWT_ENV_CONFIG_KEY } from './constant'
import { JwtEnvConfig } from './type'

export const jwtEnvConfig: () => JwtEnvConfig = registerAs(JWT_ENV_CONFIG_KEY, () => ({
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  jwtAccessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL as DurationString,
  jwtRefreshTokenTtl: process.env.JWT_REFRESH_TOKEN_TTL as DurationString,
}))

function getJwtConfigFactory({ jwtSecretKey }: ConfigType<typeof jwtEnvConfig>): JwtModuleOptions {
  return {
    secret: jwtSecretKey,
    signOptions: {
      algorithm: 'HS256',
    },
    verifyOptions: {
      algorithms: ['HS256'],
      ignoreExpiration: false,
    },
  }
}

export const jwtModuleConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(jwtEnvConfig)],
  useFactory: getJwtConfigFactory,
  inject: [getConfigToken(JWT_ENV_CONFIG_KEY)],
}
