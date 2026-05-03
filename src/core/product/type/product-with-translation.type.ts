import { MeasurementBaseType, MeasurementUnit, Product } from '@prisma/client'

export type ProductWithTranslation = Product & {
  name: string
  description?: string | null
  measurementBaseType: MeasurementBaseType
  measurementUnit?: MeasurementUnit | null
}
