import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '@infrastructure/database'
import { CreateUserPayload, FindUserOptions } from '../type'

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById(id: string, options?: FindUserOptions): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      ...options,
    })

    return user
  }

  public async findByEmail(email: string, options?: FindUserOptions): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      ...options,
    })

    return user
  }

  public async create(payload: CreateUserPayload): Promise<User> {
    const newUser = this.prismaService.user.create({
      data: payload,
    })

    return newUser
  }
}
