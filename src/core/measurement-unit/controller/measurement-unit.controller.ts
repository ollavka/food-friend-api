import { Controller, Get, Query } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode } from '@prisma/client'
import { Language } from '@common/decorator'
import { MeasurementUnitApiModel } from '../api-model'
import { GetMeasurementUnitListDocs } from '../docs'
import { MeasurementUnitQueryDto } from '../dto'
import { MeasurementUnitService } from '../service'

@ApiTags('Measurements')
@ApiExtraModels(MeasurementUnitApiModel)
@Controller('measurement/units')
export class MeasurementUnitController {
  public constructor(private readonly measurementUnitService: MeasurementUnitService) {}

  @Get()
  @GetMeasurementUnitListDocs()
  public async getMeasurementUnitList(
    @Language() languageCode: LanguageCode,
    @Query() { filter }: MeasurementUnitQueryDto,
  ): Promise<MeasurementUnitApiModel[]> {
    return this.measurementUnitService.getAllMeasurementUnits(languageCode, filter)
  }
}
