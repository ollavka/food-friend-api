import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { isEmail } from 'class-validator'
import { Uuid } from '@common/type'
import { isUuid } from '@common/util'
import { PrismaService } from '@infrastructure/database'
import { CreateUserPayload, FindUserOptions, UserNutritionProfile } from '../type'

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById<T extends FindUserOptions>(
    id: string,
    options?: T,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.UserGetPayload<T> | null> {
    const db = tx ?? this.prismaService
    const user = await db.user.findUnique({
      where: { id },
      ...options,
    })

    return user as Prisma.UserGetPayload<T>
  }

  public async findByEmail<T extends FindUserOptions>(
    email: string,
    options?: T,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.UserGetPayload<T> | null> {
    const db = tx ?? this.prismaService
    const user = await db.user.findUnique({
      where: { email },
      ...options,
    })

    return user as Prisma.UserGetPayload<T>
  }

  public async create(payload: CreateUserPayload, tx?: Prisma.TransactionClient): Promise<User> {
    const db = tx ?? this.prismaService
    const newUser = await db.user.create({
      data: payload,
    })

    return newUser
  }

  public async findOrCreate(
    idOrEmail: string,
    payload: Omit<CreateUserPayload, 'lastEmailVerificationMailSentAt' | 'lastResetPasswordMailSentAt'>,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const foundUser = isUuid(idOrEmail)
      ? await this.findById(idOrEmail, {}, tx)
      : await this.findByEmail(idOrEmail, {}, tx)

    if (foundUser) {
      return foundUser
    }

    const createdUser = await this.create(
      {
        ...payload,
        lastEmailVerificationMailSentAt: null,
        lastResetPasswordMailSentAt: null,
      },
      tx,
    )

    return createdUser
  }

  public async update(idOrEmail: string, data: Prisma.UserUpdateInput, tx?: Prisma.TransactionClient): Promise<User> {
    const db = tx ?? this.prismaService
    const where = isEmail(idOrEmail) ? { email: idOrEmail } : { id: idOrEmail }

    const updatedUser = await db.user.update({
      where,
      data,
    })

    return updatedUser
  }

  public async getNutritionProfileByUserId(
    userId: Uuid,
    tx?: Prisma.TransactionClient,
  ): Promise<UserNutritionProfile | null> {
    const db = tx ?? this.prismaService
    const profile = await db.userNutritionProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!profile) {
      return null
    }

    return this.mapNutritionProfile(profile)
  }

  public async upsertNutritionProfile(
    userId: Uuid,
    data: Pick<
      Prisma.UserNutritionProfileUncheckedCreateInput,
      'sex' | 'age' | 'heightCm' | 'weightKg' | 'activityLevel' | 'goal' | 'targetCalories'
    >,
    tx?: Prisma.TransactionClient,
  ): Promise<UserNutritionProfile> {
    const db = tx ?? this.prismaService
    const profile = await db.userNutritionProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        sex: data.sex,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: data.activityLevel,
        goal: data.goal,
        targetCalories: data.targetCalories,
      },
      update: {
        sex: data.sex,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: data.activityLevel,
        goal: data.goal,
        targetCalories: data.targetCalories,
      },
    })

    return this.mapNutritionProfile(profile)
  }

  private mapNutritionProfile(
    profile: Prisma.UserNutritionProfileGetPayload<Record<never, never>>,
  ): UserNutritionProfile {
    return {
      id: <Uuid>profile.id,
      userId: <Uuid>profile.userId,
      sex: profile.sex,
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: Number(profile.weightKg),
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      targetCalories: profile.targetCalories,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }
}
