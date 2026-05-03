import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode, MeasurementUnitKey } from '@prisma/client'
import { MeasurementUnitService } from './measurement-unit.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'

describe('MeasurementUnitService', () => {
  const measurementUnitRepository: any = {
    findAllMeasurementUnits: jest.fn(),
    findMeasurementUnitById: jest.fn(),
    findMeasurementUnitByKey: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
  }

  let service: MeasurementUnitService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
    })

    service = new MeasurementUnitService(measurementUnitRepository, languageService)
  })

  it('should return mapped unit list with localized label', async () => {
    measurementUnitRepository.findAllMeasurementUnits.mockResolvedValue([
      {
        id: 'unit-1',
        key: MeasurementUnitKey.G,
        translations: [{ label: 'Gram' }],
      },
    ])

    const result = await service.getAllMeasurementUnits(LanguageCode.EN, {})

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Gram')
  })

  it('should delegate get by id and key', async () => {
    const unit = { id: 'unit-1', key: MeasurementUnitKey.G }
    measurementUnitRepository.findMeasurementUnitById.mockResolvedValue(unit)
    measurementUnitRepository.findMeasurementUnitByKey.mockResolvedValue(unit)

    expect(await service.getMeasurementUnitById('unit-1' as never)).toEqual(unit)
    expect(await service.getMeasurementUnitByKey(MeasurementUnitKey.G)).toEqual(unit)
  })
})
