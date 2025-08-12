import { randomInt } from 'node:crypto'

export function generateRandomCode(): string {
  const min = 100000
  const max = 1_000_000
  const randomNumber = randomInt(min, max)
  return randomNumber.toString().padStart(6, '0')
}
