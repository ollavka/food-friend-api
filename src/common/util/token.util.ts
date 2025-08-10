import { isHexadecimal } from 'class-validator'
import { Token, Uuid } from '@common/type'
import { def } from './def.util'
import { uuid } from './uuid.util'

export function token(): Token {
  return uuid().replaceAll(/-/g, '')
}

export function isToken(value: unknown): value is Token {
  return typeof value === 'string' && value.length === 32 && isHexadecimal(value)
}

export function uuidToToken<T extends Uuid>(uuid: T): Token
export function uuidToToken<T extends undefined | null>(uuid: T | Uuid): T | Token {
  return def(uuid) ? uuid.replaceAll(/-/g, '') : uuid
}

export function tokenToUuid<T extends Token>(token: T): Uuid
export function tokenToUuid<T extends undefined | null>(token: T | Token): T | Uuid {
  if (!def(token)) {
    return token
  }

  const match = token.match(/(.{8})(.{4})(.{4})(.{4})(.{12})/)
  return match!.slice(1).join('-')
}
