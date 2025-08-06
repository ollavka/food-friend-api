import { AnyCase } from '@common/type'
import { ALL_UNITS } from '../constant'

export type Unit = AnyCase<(typeof ALL_UNITS)[number]>
