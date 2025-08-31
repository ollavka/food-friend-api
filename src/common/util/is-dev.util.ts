import { Environment } from '@common/enum'

export function isDev(): boolean {
  const environment = process.env.NODE_ENV
  return environment === Environment.Development
}
