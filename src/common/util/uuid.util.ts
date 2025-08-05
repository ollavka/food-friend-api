import { isUUID } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { Uuid } from '../type'

export function uuid(): Uuid {
  return uuidv4()
}

export function isUuid(value: unknown): value is Uuid {
  return isUUID(value)
}
