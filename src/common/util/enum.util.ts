type EnumLike = Record<string | number, unknown>

function enumNamedKeys<T extends EnumLike, K extends keyof T>(enumObj: T): Array<Extract<K, string>> {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key))) as Array<Extract<K, string>>
}

export function enumKey<T extends EnumLike, K extends keyof T, V extends T[K]>(
  enumObj: T,
  targetValue: V,
): Extract<K, string> | null {
  return (enumNamedKeys(enumObj).find((key) => enumObj[key] === targetValue) ?? null) as Extract<K, string> | null
}

export function enumValue<T extends EnumLike, K extends keyof T, V extends T[K]>(
  enumObj: T,
  targetKey: Extract<K, string>,
): V | null {
  const key = enumNamedKeys(enumObj).find((key) => key === targetKey) ?? null
  return key ? (enumObj[key] as V) : null
}
