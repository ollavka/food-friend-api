import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import * as EnvSchemas from '../env-schema'

export function envSchemaValidator(config: Record<string, unknown>): Record<string, unknown> {
  const schemas = [...Object.values(EnvSchemas)]
  const errors: string[] = []

  for (const Schema of schemas) {
    const dto = plainToInstance(<ClassConstructor<Record<string, unknown>>>(<unknown>Schema), config)
    const result = validateSync(dto)

    if (result.length > 0) {
      errors.push(...result.flatMap((err) => (err.constraints ? Object.values(err.constraints) : [])))
    }
  }

  if (errors.length > 0) {
    throw new Error(`Config validation error:\n${errors.join('\n')}`)
  }

  return config
}
