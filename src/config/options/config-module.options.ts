import { ConfigModuleOptions } from '@nestjs/config'
import { appConfig } from '../app.config'
import { envSchemaValidator } from '../validation'

export const configModuleOptions: ConfigModuleOptions = {
  cache: true,
  envFilePath: ['.env'],
  isGlobal: true,
  expandVariables: true,
  load: [appConfig],
  validate: envSchemaValidator,
}
