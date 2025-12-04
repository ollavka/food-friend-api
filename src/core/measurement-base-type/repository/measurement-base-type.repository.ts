import { Controller } from '@nestjs/common'
import { Language, MeasurementBaseType, MeasurementBaseTypeKey, MeasurementBaseTypeTranslation } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Controller()
export class MeasurementBaseTypeRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findAllMeasurementBaseTypes(
    language: Language,
  ): Promise<Array<MeasurementBaseType & { translations: MeasurementBaseTypeTranslation[] }>> {
    return this.prismaService.measurementBaseType.findMany({
      include: {
        translations: {
          where: {
            languageId: language.id,
          },
        },
      },
    })
  }

  public async findMeasurementBaseTypeById(id: Uuid): Promise<MeasurementBaseType | null> {
    return this.prismaService.measurementBaseType.findUnique({
      where: {
        id,
      },
    })
  }

  public async findMeasurementBaseTypeByKey(key: MeasurementBaseTypeKey): Promise<MeasurementBaseType | null> {
    return this.prismaService.measurementBaseType.findUnique({
      where: {
        key,
      },
    })
  }
}
