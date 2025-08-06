import {
  MS_IN_DAY,
  MS_IN_HOUR,
  MS_IN_MINUTE,
  MS_IN_MONTH,
  MS_IN_SECOND,
  MS_IN_WEEK,
  MS_IN_YEAR,
} from '@common/constant'
import * as units from './units.constant'

function generateUnitMap(units: any, multiplier = 1): Record<string, number> {
  const unitEntries = units.map((unit) => [unit.toLowerCase(), multiplier])
  const unitsMap = Object.fromEntries(unitEntries)
  return unitsMap
}

export const UNITS_MAP: Record<string, number> = {
  ...generateUnitMap(units.MILLISECOND_UNITS),
  ...generateUnitMap(units.SECOND_UNITS, MS_IN_SECOND),
  ...generateUnitMap(units.MINUTE_UNITS, MS_IN_MINUTE),
  ...generateUnitMap(units.HOUR_UNITS, MS_IN_HOUR),
  ...generateUnitMap(units.DAY_UNITS, MS_IN_DAY),
  ...generateUnitMap(units.WEEK_UNITS, MS_IN_WEEK),
  ...generateUnitMap(units.MONTH_UNITS, MS_IN_MONTH),
  ...generateUnitMap(units.YEAR_UNITS, MS_IN_YEAR),
}
