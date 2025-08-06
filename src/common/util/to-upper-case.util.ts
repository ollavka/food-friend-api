export function toUpperCase<T>(value: T): T | string {
  return typeof value === 'string' ? value.toUpperCase() : value
}
