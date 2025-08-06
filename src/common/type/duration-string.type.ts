import { Unit } from '@common/util/convert-to-ms.util/type'

export type DurationString = `${number}` | `${number}${Unit}` | `${number} ${Unit}`
