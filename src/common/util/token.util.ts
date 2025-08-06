import { isHexadecimal } from 'class-validator'
import { Token } from '@common/type'
import { isUuid, uuid } from './uuid.util'

export function generateToken(): Token {
  const randomUUID = uuid()
  const token = randomUUID.replaceAll(/-/g, '')
  return token
}

export function isToken(value: unknown): value is Token {
  const isValidHexString = typeof value === 'string' && isHexadecimal(value) && value.length === 32

  if (!isValidHexString) {
    return false
  }

  const match = value.match(/(.{8})(.{4})(.{4})(.{4})(.{12})/)

  if (!match) {
    return false
  }

  const uuidStr = match.slice(1).join('-')
  const isValidUUID = isUuid(uuidStr)

  return isValidUUID
}
