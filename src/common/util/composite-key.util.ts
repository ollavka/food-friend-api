export function buildCompositeKey(...parts: Array<string | number>): string {
  return parts.map((part) => String(part)).join(':')
}
