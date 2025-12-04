import { Controller, Get } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode } from '@prisma/client'
import { Language } from '@common/decorator'
import { MeasurementBaseTypeApiModel } from '../api-model'
import { GetMeasurementBaseTypeListDocs } from '../docs'
import { MeasurementBaseTypeService } from '../service'

@ApiTags('Measurements')
@ApiExtraModels(MeasurementBaseTypeApiModel)
@Controller('measurement/base-types')
export class MeasurementBaseTypeController {
  public constructor(private readonly measurementBaseTypeService: MeasurementBaseTypeService) {}

  @Get()
  @GetMeasurementBaseTypeListDocs()
  public async getMeasurementBaseTypeList(
    @Language() languageCode: LanguageCode,
  ): Promise<MeasurementBaseTypeApiModel[]> {
    return this.measurementBaseTypeService.getAllMeasurementBaseTypes(languageCode)
  }
}
