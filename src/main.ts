import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { APP_ENV_CONFIG_KEY, AppEnvConfig } from '@config/app'
import { getCorsOptions } from '@config/cors'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService<{ [APP_ENV_CONFIG_KEY]: AppEnvConfig }, true>>(ConfigService)
  const { host, logLevels, port, allowedOrigins } = configService.get<AppEnvConfig>(APP_ENV_CONFIG_KEY)

  app.useLogger(logLevels)
  app.enableCors(getCorsOptions(allowedOrigins))
  app.use(cookieParser())

  await app.listen(port, host)
}

void bootstrap()
