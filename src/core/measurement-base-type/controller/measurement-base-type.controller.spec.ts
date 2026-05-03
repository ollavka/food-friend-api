import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MeasurementBaseTypeController } from './measurement-base-type.controller'

describe('MeasurementBaseTypeController', () => {
  const measurementBaseTypeService: any = {
    getAllMeasurementBaseTypes: jest.fn(),
  }

  let controller: MeasurementBaseTypeController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new MeasurementBaseTypeController(measurementBaseTypeService)
  })

  it('should delegate getMeasurementBaseTypeList', async () => {
    measurementBaseTypeService.getAllMeasurementBaseTypes.mockResolvedValue([{ key: 'MASS' }])

    const result = await controller.getMeasurementBaseTypeList('EN' as never)

    expect(result).toEqual([{ key: 'MASS' }])
    expect(measurementBaseTypeService.getAllMeasurementBaseTypes).toHaveBeenCalledWith('EN')
  })
})
