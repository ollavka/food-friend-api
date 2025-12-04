import { Module } from '@nestjs/common'
import { MeasurementBaseTypeController } from './controller'
import { MeasurementBaseTypeRepository } from './repository'
import { MeasurementBaseTypeService } from './service'

@Module({
  controllers: [MeasurementBaseTypeController],
  providers: [MeasurementBaseTypeService, MeasurementBaseTypeRepository],
  exports: [MeasurementBaseTypeService],
})
export class MeasurementBaseTypeModule {}
