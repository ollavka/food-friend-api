import { Nullable, ObjectEntry, ObjectKey } from '@common/type'
import { def } from './def.util'

export function objectEntries<T extends object>(object: T): Array<ObjectEntry<T>> {
  return <Array<ObjectEntry<T>>>Object.entries(object)
}

export function objectKeys<T extends object>(object: T): Array<ObjectKey<T>> {
  return <Array<ObjectKey<T>>>Object.keys(object)
}

export function isEmptyObject<T extends null | undefined>(object: T): boolean
export function isEmptyObject<T extends Nullable<object>>(object: T): boolean
export function isEmptyObject<T extends Record<string | number, unknown>>(object: T): boolean {
  if (!def(object)) {
    return true
  }

  return !Object.values(object).filter(def).length
}
