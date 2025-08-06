import { ConfigService } from '@nestjs/config'
import { Environment } from '@common/enum'

export function isDev(configService: ConfigService<any, true>): boolean {
  const environment = configService.getOrThrow<Environment>('NODE_ENV')
  return environment === Environment.Development
}

export const IS_DEV = process.env.NODE_ENV === Environment.Development
