export type ObjectEntry<T, K extends keyof T = keyof T> = K extends unknown ? [K, T[K]] : never
export type ObjectKey<T, K extends keyof T = keyof T> = K extends unknown ? K : never
