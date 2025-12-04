import { Controller } from '@nestjs/common'
import { Language, MeasurementUnit, MeasurementUnitKey, MeasurementUnitTranslation } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'
import { MeasurementUnitFilterQueryDto } from '../dto'

@Controller()
export class MeasurementUnitRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findAllMeasurementUnits(
    language: Language,
    filter?: MeasurementUnitFilterQueryDto,
  ): Promise<Array<MeasurementUnit & { translations: MeasurementUnitTranslation[] }>> {
    const { isUserSelectable, isBaseUnit } = filter ?? {}

    return this.prismaService.measurementUnit.findMany({
      where: {
        isUserSelectable,
        isBaseUnit,
      },
      include: {
        translations: {
          where: {
            languageId: language.id,
          },
        },
      },
    })
  }

  public async findMeasurementUnitById(id: Uuid): Promise<MeasurementUnit | null> {
    return this.prismaService.measurementUnit.findUnique({
      where: {
        id,
      },
    })
  }

  public async findMeasurementUnitByKey(key: MeasurementUnitKey): Promise<MeasurementUnit | null> {
    return this.prismaService.measurementUnit.findUnique({
      where: {
        key,
      },
    })
  }
}
