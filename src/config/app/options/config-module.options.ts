import { ConfigModuleOptions } from '@nestjs/config'
import { appEnvConfig } from '../app.config'
import { envSchemaValidator } from '../validation'

export const configModuleOptions: ConfigModuleOptions = {
  cache: true,
  envFilePath: ['.env'],
  isGlobal: true,
  expandVariables: true,
  load: [appEnvConfig],
  validate: envSchemaValidator,
}
