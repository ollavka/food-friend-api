import { createBaseQueryDto } from '@common/dto'
import { MeasurementUnitFilterQueryDto } from './measurement-unit-filter-query.dto'

export class MeasurementUnitQueryDto extends createBaseQueryDto({
  filterDto: MeasurementUnitFilterQueryDto,
}) {}
