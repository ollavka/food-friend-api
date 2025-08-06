import { DurationString } from '@common/type'

export type JwtEnvConfig = {
  jwtSecretKey: string
  jwtAccessTokenTtl: DurationString
  jwtRefreshTokenTtl: DurationString
}
