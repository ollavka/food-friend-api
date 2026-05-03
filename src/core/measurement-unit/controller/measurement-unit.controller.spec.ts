import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MeasurementUnitController } from './measurement-unit.controller'

describe('MeasurementUnitController', () => {
  const measurementUnitService: any = {
    getAllMeasurementUnits: jest.fn(),
  }

  let controller: MeasurementUnitController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new MeasurementUnitController(measurementUnitService)
  })

  it('should delegate getMeasurementUnitList', async () => {
    measurementUnitService.getAllMeasurementUnits.mockResolvedValue([{ key: 'G' }])

    const result = await controller.getMeasurementUnitList('EN' as never, { filter: {} } as never)

    expect(result).toEqual([{ key: 'G' }])
    expect(measurementUnitService.getAllMeasurementUnits).toHaveBeenCalledWith('EN', {})
  })
})
