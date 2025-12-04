import { Injectable } from '@nestjs/common'
import { LanguageCode, MeasurementUnit, MeasurementUnitKey } from '@prisma/client'
import { Uuid } from '@common/type'
import { LanguageService } from '@core/language'
import { MeasurementUnitApiModel } from '../api-model'
import { MeasurementUnitFilterQueryDto } from '../dto'
import { MeasurementUnitRepository } from '../repository'

@Injectable()
export class MeasurementUnitService {
  public constructor(
    private readonly measurementUnitRepository: MeasurementUnitRepository,
    private readonly languageService: LanguageService,
  ) {}

  public async getAllMeasurementUnits(
    languageCode: LanguageCode,
    filter?: MeasurementUnitFilterQueryDto,
  ): Promise<MeasurementUnitApiModel[]> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const units = await this.measurementUnitRepository.findAllMeasurementUnits(language, filter)
    const mappedUnits = units.map(({ translations, ...unit }) => {
      const [{ label }] = translations

      return {
        ...unit,
        label,
      }
    })

    return MeasurementUnitApiModel.fromList(mappedUnits)
  }

  public async getMeasurementUnitById(id: Uuid): Promise<MeasurementUnit | null> {
    return this.measurementUnitRepository.findMeasurementUnitById(id)
  }

  public async getMeasurementUnitByKey(key: MeasurementUnitKey): Promise<MeasurementUnit | null> {
    return this.measurementUnitRepository.findMeasurementUnitByKey(key)
  }
}
