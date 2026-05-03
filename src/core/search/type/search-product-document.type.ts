import { MeasurementBaseTypeKey, MeasurementUnitKey } from '@prisma/client'
import { Uuid } from '@common/type'

export type SearchProductDocument = {
  id: Uuid
  slug: string
  isSystem: boolean
  ownerId: Uuid | null
  imageUrl: string | null
  measurementBaseTypeKey: MeasurementBaseTypeKey
  measurementUnitKey: MeasurementUnitKey | null
  namesByLanguage: Record<string, string>
  descriptionsByLanguage: Record<string, string>
  searchNames: string[]
  searchDescriptions: string[]
  createdAtTs: number
  updatedAtTs: number
}
