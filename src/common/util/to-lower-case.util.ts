export function toLowerCase<T>(value: T): T | string {
  return typeof value === 'string' ? value.toLowerCase() : value
}
