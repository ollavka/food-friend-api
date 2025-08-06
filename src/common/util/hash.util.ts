import { createHash } from 'node:crypto'
import { Hash, Uuid } from '../type'
import { def, uuid } from '.'

const characters = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const base = BigInt(characters.length)
const hashLength = 22
const maxUuidInt = 340282366920938463463374607431768211455n

export function uuidToHash<T extends Uuid>(uuid: T): Hash
export function uuidToHash<T extends undefined | null>(uuid: T | Uuid): T | Hash {
  if (!def(uuid)) {
    return uuid
  }

  const hex = uuid.replace(/-/g, '')
  let int = BigInt(`0x${hex}`)
  let hash = ''

  do {
    hash = characters[Number(int % base)] + hash
    int /= base
  } while (0 < int)

  return hash.padStart(hashLength, characters[0])
}

export function hashToUuid<T extends Hash>(hash: T): Uuid
export function hashToUuid<T extends undefined | null>(hash: T | Hash): T | Uuid {
  if (!def(hash)) {
    return hash
  }

  const int = hashToInt(hash)

  if (int === null) {
    throw new Error('Invalid hash.')
  }

  const hex = int.toString(16).padStart(32, '0')
  const match = hex.match(/(.{8})(.{4})(.{4})(.{4})(.{12})/)
  return match!.slice(1).join('-')
}

export function isHash(value: unknown): value is Hash {
  return typeof value === 'string' && value.length === hashLength && hashToInt(value) !== null
}

export function randomHash(): Hash {
  return uuidToHash(uuid())
}

export function hashValue(value: string): string {
  const hash = createHash('sha256').update(value).digest('hex')
  return hash
}

function hashToInt(hash: Hash): null | bigint {
  const indexes = Array.from(hash).map((character) => characters.indexOf(character))

  if (indexes.some((index) => index < 0)) {
    return null
  }

  const int = indexes.reduce((int, index) => int * base + BigInt(index), BigInt(0))

  if (maxUuidInt < int) {
    return null
  }

  return int
}
