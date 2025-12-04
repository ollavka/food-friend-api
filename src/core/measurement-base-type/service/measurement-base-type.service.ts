import { Injectable } from '@nestjs/common'
import { LanguageCode, MeasurementBaseType, MeasurementBaseTypeKey } from '@prisma/client'
import { Uuid } from '@common/type'
import { LanguageService } from '@core/language'
import { MeasurementBaseTypeApiModel } from '../api-model'
import { MeasurementBaseTypeRepository } from '../repository'

@Injectable()
export class MeasurementBaseTypeService {
  public constructor(
    private readonly measurementBaseTypeRepository: MeasurementBaseTypeRepository,
    private readonly languageService: LanguageService,
  ) {}

  public async getAllMeasurementBaseTypes(languageCode: LanguageCode): Promise<MeasurementBaseTypeApiModel[]> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const baseTypes = await this.measurementBaseTypeRepository.findAllMeasurementBaseTypes(language)
    const mappedBaseTypes = baseTypes.map(({ translations, ...baseType }) => {
      const [{ label }] = translations

      return {
        ...baseType,
        label,
      }
    })

    return MeasurementBaseTypeApiModel.fromList(mappedBaseTypes)
  }

  public async getMeasurementBaseTypeById(id: Uuid): Promise<MeasurementBaseType | null> {
    return this.measurementBaseTypeRepository.findMeasurementBaseTypeById(id)
  }

  public async getMeasurementBaseTypeByKey(key: MeasurementBaseTypeKey): Promise<MeasurementBaseType | null> {
    return this.measurementBaseTypeRepository.findMeasurementBaseTypeById(key)
  }
}
