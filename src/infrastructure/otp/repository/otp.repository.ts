import { Injectable } from '@nestjs/common'
import { OtpCode, OtpCodeType, Prisma } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class OtpRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById(id: Uuid): Promise<OtpCode | null> {
    const otpCode = await this.prismaService.otpCode.findUnique({
      where: { id },
    })

    return otpCode
  }

  public async removeById(id: Uuid): Promise<boolean> {
    await this.prismaService.otpCode.deleteMany({ where: { id } })
    return true
  }

  public async updateCode(
    id: Uuid,
    data: Pick<Prisma.OtpCodeUpdateInput, 'attempts' | 'expiresAt' | 'windowStartedAt'>,
  ): Promise<OtpCode> {
    const otpCode = await this.prismaService.otpCode.update({
      where: {
        id,
      },
      data,
    })

    return otpCode
  }

  public async saveCode(hashedCode: string, email: string, type: OtpCodeType, expiresAt: Date): Promise<OtpCode> {
    const commonUpsertData = {
      codeHash: hashedCode,
      expiresAt,
      attempts: 0,
      windowStartedAt: null,
    }

    const otpCode = await this.prismaService.otpCode.upsert({
      where: {
        email_type: {
          email,
          type,
        },
      },
      create: {
        ...commonUpsertData,
        email,
        type,
      },
      update: commonUpsertData,
    })

    return otpCode
  }
}
