import { toLowerCase } from './to-lower-case.util'

export function capitalize(value: string): string {
  const lowerCaseValue = toLowerCase(value)
  return lowerCaseValue[0].toUpperCase() + lowerCaseValue.slice(1)
}
