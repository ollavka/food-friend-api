import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfig } from '@/config/interface'
import { getCorsOptions } from './options'

export async function setupCors(app: INestApplication): Promise<void> {
  const configService = app.get<ConfigService<{ app: AppConfig }, true>>(ConfigService)
  const { allowedOrigins } = configService.get<AppConfig>('app')
  const corsOptions = getCorsOptions(allowedOrigins)
  app.enableCors(corsOptions)
}
