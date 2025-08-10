import { def } from './def.util'

export function toJsonString<T>(value: T): string
export function toJsonString<T extends null | undefined>(value: T): string | T {
  return def(value) ? JSON.stringify(value, null, 2) : value
}
