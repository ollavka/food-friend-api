import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { setupCors } from '@common/initializer'
import { AppConfig } from '@config/interface'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService<{ app: AppConfig }, true>>(ConfigService)
  const { host, logLevels, port } = configService.get<AppConfig>('app')
  app.useLogger(logLevels)
  await setupCors(app)
  await app.listen(port, host)
}

void bootstrap()
