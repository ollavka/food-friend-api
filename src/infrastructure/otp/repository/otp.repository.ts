import { Injectable } from '@nestjs/common'
import { OtpCode, OtpCodeType, Prisma, User } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class OtpRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById(id: Uuid, tx?: Prisma.TransactionClient): Promise<OtpCode | null> {
    const db = tx ?? this.prismaService
    const otpCode = await db.otpCode.findUnique({
      where: { id },
    })

    return otpCode
  }

  public async removeById(id: Uuid, tx?: Prisma.TransactionClient): Promise<boolean> {
    const db = tx ?? this.prismaService
    await db.otpCode.deleteMany({ where: { id } })
    return true
  }

  public async update(
    id: Uuid,
    data: Pick<Prisma.OtpCodeUpdateInput, 'attempts' | 'expiresAt' | 'windowStartedAt' | 'status'>,
    tx?: Prisma.TransactionClient,
  ): Promise<OtpCode> {
    const db = tx ?? this.prismaService
    const otpCode = await db.otpCode.update({
      where: {
        id,
      },
      data,
    })

    return otpCode
  }

  public async updateMany(
    where: NonNullable<Prisma.OtpCodeUpdateManyArgs['where']>,
    data: Pick<Prisma.OtpCodeUpdateInput, 'attempts' | 'expiresAt' | 'windowStartedAt' | 'status'>,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = tx ?? this.prismaService
    const { count } = await db.otpCode.updateMany({
      where,
      data,
    })

    return count
  }

  public async save(
    hashedCode: string,
    user: User,
    type: OtpCodeType,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<OtpCode> {
    const db = tx ?? this.prismaService
    const commonUpsertData = {
      codeHash: hashedCode,
      expiresAt,
      attempts: 0,
      windowStartedAt: null,
    }

    const otpCode = await db.otpCode.upsert({
      where: {
        email_type: {
          email: user.email,
          type,
        },
      },
      create: {
        ...commonUpsertData,
        email: user.email,
        type,
        user: { connect: { id: user.id } },
      },
      update: commonUpsertData,
    })

    return otpCode
  }
}
