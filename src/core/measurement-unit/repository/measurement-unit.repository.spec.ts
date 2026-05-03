import { describe, expect, it, jest } from '@jest/globals'
import { MeasurementBaseTypeKey, MeasurementUnitKey } from '@prisma/client'
import { MeasurementUnitRepository } from './measurement-unit.repository'

describe('MeasurementUnitRepository', () => {
  const createRepository = (): { repository: MeasurementUnitRepository; prismaService: any } => {
    const prismaService: any = {
      measurementUnit: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const repository = new MeasurementUnitRepository(prismaService as any)
    return { repository, prismaService }
  }

  it('should find all measurement units with optional filter', async () => {
    const { repository, prismaService } = createRepository()
    prismaService.measurementUnit.findMany.mockResolvedValue([])

    await repository.findAllMeasurementUnits(
      { id: 'language-id' } as any,
      { isUserSelectable: true, isBaseUnit: true, baseType: MeasurementBaseTypeKey.MASS } as any,
    )

    expect(prismaService.measurementUnit.findMany).toHaveBeenCalledWith({
      where: {
        isUserSelectable: true,
        isBaseUnit: true,
        baseType: { key: MeasurementBaseTypeKey.MASS },
      },
      include: {
        translations: {
          where: { languageId: 'language-id' },
        },
      },
    })
  })

  it('should find by id and by key', async () => {
    const { repository, prismaService } = createRepository()

    await repository.findMeasurementUnitById('unit-id' as any)
    await repository.findMeasurementUnitByKey(MeasurementUnitKey.G)

    expect(prismaService.measurementUnit.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: 'unit-id' },
    })
    expect(prismaService.measurementUnit.findUnique).toHaveBeenNthCalledWith(2, {
      where: { key: MeasurementUnitKey.G },
    })
  })
})
