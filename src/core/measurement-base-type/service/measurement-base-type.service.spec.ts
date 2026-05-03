import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode, MeasurementBaseTypeKey } from '@prisma/client'
import { MeasurementBaseTypeService } from './measurement-base-type.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'

describe('MeasurementBaseTypeService', () => {
  const measurementBaseTypeRepository: any = {
    findAllMeasurementBaseTypes: jest.fn(),
    findMeasurementBaseTypeById: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
  }

  let service: MeasurementBaseTypeService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
    })

    service = new MeasurementBaseTypeService(measurementBaseTypeRepository, languageService)
  })

  it('should return mapped list with localized labels', async () => {
    measurementBaseTypeRepository.findAllMeasurementBaseTypes.mockResolvedValue([
      {
        id: 'base-1',
        key: MeasurementBaseTypeKey.MASS,
        translations: [{ label: 'Mass' }],
      },
    ])

    const result = await service.getAllMeasurementBaseTypes(LanguageCode.EN)

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Mass')
  })

  it('should delegate get by id and get by key', async () => {
    const entity = { id: 'base-1', key: MeasurementBaseTypeKey.MASS }
    measurementBaseTypeRepository.findMeasurementBaseTypeById.mockResolvedValue(entity)

    expect(await service.getMeasurementBaseTypeById('base-1' as never)).toEqual(entity)
    expect(await service.getMeasurementBaseTypeByKey(MeasurementBaseTypeKey.MASS)).toEqual(entity)
    expect(measurementBaseTypeRepository.findMeasurementBaseTypeById).toHaveBeenCalledTimes(2)
  })
})
