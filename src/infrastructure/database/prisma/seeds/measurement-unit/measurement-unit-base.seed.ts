import { MeasurementBaseTypeKey, MeasurementUnitKey, PrismaClient } from '@prisma/client'
import { SeededMeasurementBaseTypeMap } from '../measurement-base-type/type'
import { SeededMeasurementUnitMap } from './type'

export async function seedMeasurementUnitsBase(
  prisma: PrismaClient,
  baseTypes: SeededMeasurementBaseTypeMap,
): Promise<SeededMeasurementUnitMap> {
  // eslint-disable-next-line no-console
  console.log('Seeding measurement units...')

  const massBaseType = baseTypes[MeasurementBaseTypeKey.MASS]
  const volumeBaseType = baseTypes[MeasurementBaseTypeKey.VOLUME]
  const countBaseType = baseTypes[MeasurementBaseTypeKey.COUNT]

  const [gUnit, kgUnit, mlUnit, lUnit, pcUnit] = await Promise.all([
    prisma.measurementUnit.upsert({
      where: {
        key: MeasurementUnitKey.G,
      },
      create: {
        key: MeasurementUnitKey.G,
        baseTypeId: massBaseType.id,
        ratioToBaseConvert: 1,
        isBaseUnit: true,
        isUserSelectable: true,
      },
      update: {
        key: MeasurementUnitKey.G,
        baseTypeId: massBaseType.id,
        ratioToBaseConvert: 1,
        isBaseUnit: true,
        isUserSelectable: true,
      },
    }),
    prisma.measurementUnit.upsert({
      where: {
        key: MeasurementUnitKey.KG,
      },
      create: {
        key: MeasurementUnitKey.KG,
        baseTypeId: massBaseType.id,
        ratioToBaseConvert: 1000,
        isBaseUnit: false,
        isUserSelectable: true,
      },
      update: {
        key: MeasurementUnitKey.KG,
        baseTypeId: massBaseType.id,
        ratioToBaseConvert: 1000,
        isBaseUnit: false,
        isUserSelectable: true,
      },
    }),
    prisma.measurementUnit.upsert({
      where: {
        key: MeasurementUnitKey.ML,
      },
      create: {
        key: MeasurementUnitKey.ML,
        baseTypeId: volumeBaseType.id,
        ratioToBaseConvert: 1,
        isBaseUnit: true,
        isUserSelectable: true,
      },
      update: {
        key: MeasurementUnitKey.ML,
        baseTypeId: volumeBaseType.id,
        ratioToBaseConvert: 1,
        isBaseUnit: true,
        isUserSelectable: true,
      },
    }),
    prisma.measurementUnit.upsert({
      where: {
        key: MeasurementUnitKey.L,
      },
      create: {
        key: MeasurementUnitKey.L,
        baseTypeId: volumeBaseType.id,
        ratioToBaseConvert: 1000,
        isBaseUnit: false,
        isUserSelectable: true,
      },
      update: {
        key: MeasurementUnitKey.L,
        baseTypeId: volumeBaseType.id,
        ratioToBaseConvert: 1000,
        isBaseUnit: false,
        isUserSelectable: true,
      },
    }),
    prisma.measurementUnit.upsert({
      where: {
        key: MeasurementUnitKey.PC,
      },
      create: {
        key: MeasurementUnitKey.PC,
        baseTypeId: countBaseType.id,
        ratioToBaseConvert: 1,
        isBaseUnit: true,
        isUserSelectable: true,
      },
      update: {
        key: MeasurementUnitKey.PC,
        baseTypeId: countBaseType.id,
        ratioToBaseConvert: 1,
        isBaseUnit: true,
        isUserSelectable: true,
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Measurement units seeded ✅')

  return {
    [MeasurementUnitKey.G]: gUnit,
    [MeasurementUnitKey.KG]: kgUnit,
    [MeasurementUnitKey.ML]: mlUnit,
    [MeasurementUnitKey.L]: lUnit,
    [MeasurementUnitKey.PC]: pcUnit,
  }
}
