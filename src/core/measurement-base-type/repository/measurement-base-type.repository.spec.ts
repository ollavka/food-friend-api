import { describe, expect, it, jest } from '@jest/globals'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { MeasurementBaseTypeRepository } from './measurement-base-type.repository'

describe('MeasurementBaseTypeRepository', () => {
  const createRepository = (): { repository: MeasurementBaseTypeRepository; prismaService: any } => {
    const prismaService: any = {
      measurementBaseType: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const repository = new MeasurementBaseTypeRepository(prismaService as any)
    return { repository, prismaService }
  }

  it('should find all measurement base types with translations by language', async () => {
    const { repository, prismaService } = createRepository()
    prismaService.measurementBaseType.findMany.mockResolvedValue([])

    await repository.findAllMeasurementBaseTypes({ id: 'language-id' } as any)

    expect(prismaService.measurementBaseType.findMany).toHaveBeenCalledWith({
      include: {
        translations: {
          where: { languageId: 'language-id' },
        },
      },
    })
  })

  it('should find by id and by key', async () => {
    const { repository, prismaService } = createRepository()

    await repository.findMeasurementBaseTypeById('base-id' as any)
    await repository.findMeasurementBaseTypeByKey(MeasurementBaseTypeKey.MASS)

    expect(prismaService.measurementBaseType.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: 'base-id' },
    })
    expect(prismaService.measurementBaseType.findUnique).toHaveBeenNthCalledWith(2, {
      where: { key: MeasurementBaseTypeKey.MASS },
    })
  })
})
