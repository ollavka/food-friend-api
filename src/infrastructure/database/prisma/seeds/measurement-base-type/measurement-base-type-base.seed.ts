import { MeasurementBaseTypeKey, PrismaClient } from '@prisma/client'
import { SeededMeasurementBaseTypeMap } from './type'

export async function seedMeasurementBaseTypesBase(prisma: PrismaClient): Promise<SeededMeasurementBaseTypeMap> {
  // eslint-disable-next-line no-console
  console.log('Seeding measurement base types...')

  const [massBaseType, volumeBaseType, countBaseType] = await Promise.all([
    prisma.measurementBaseType.upsert({
      where: {
        key: MeasurementBaseTypeKey.MASS,
      },
      create: {
        key: MeasurementBaseTypeKey.MASS,
      },
      update: {
        key: MeasurementBaseTypeKey.MASS,
      },
    }),
    prisma.measurementBaseType.upsert({
      where: {
        key: MeasurementBaseTypeKey.VOLUME,
      },
      create: {
        key: MeasurementBaseTypeKey.VOLUME,
      },
      update: {
        key: MeasurementBaseTypeKey.VOLUME,
      },
    }),
    prisma.measurementBaseType.upsert({
      where: {
        key: MeasurementBaseTypeKey.COUNT,
      },
      create: {
        key: MeasurementBaseTypeKey.COUNT,
      },
      update: {
        key: MeasurementBaseTypeKey.COUNT,
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Measurement base types seeded ✅')

  return {
    [MeasurementBaseTypeKey.MASS]: massBaseType,
    [MeasurementBaseTypeKey.VOLUME]: volumeBaseType,
    [MeasurementBaseTypeKey.COUNT]: countBaseType,
  }
}
