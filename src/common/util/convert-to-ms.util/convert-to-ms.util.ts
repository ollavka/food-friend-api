import { DurationString, Ms } from '@common/type'
import { UNITS_MAP } from './constant'

export function convertToMs(duration: DurationString): Ms {
  const regExp = /^\s*([\d]+(?:\.\d+)?)\s*([a-zA-Z]+)?\s*$/
  const match = regExp.exec(duration)

  if (!match) {
    throw new Error(`Invalid format: "${duration}".`)
  }

  const [, numStr, rawUnit] = match

  const amount = +numStr
  const unit = (rawUnit ?? 'ms').toLowerCase()
  const multiplier = UNITS_MAP[unit]

  if (!multiplier) {
    throw new Error(`Unknown unit "${rawUnit}" in "${duration}"`)
  }

  return amount * multiplier
}
