import { Module } from '@nestjs/common'
import { MeasurementUnitController } from './controller'
import { MeasurementUnitRepository } from './repository'
import { MeasurementUnitService } from './service'

@Module({
  controllers: [MeasurementUnitController],
  providers: [MeasurementUnitService, MeasurementUnitRepository],
  exports: [MeasurementUnitService],
})
export class MeasurementUnitModule {}
