import { MeasurementBaseType, Product } from '@prisma/client'

export type ProductWithTranslation = Product & { name: string; measurementBaseType: MeasurementBaseType }
