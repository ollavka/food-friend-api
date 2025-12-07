import { ApiProperty } from '@nestjs/swagger'
import { User, UserRole, UserStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'

@Exclude()
export class UserApiModel {
  @Expose()
  @ToId()
  @ApiProperty({
    description: 'User ID',
    required: true,
    example: '2Sd1axH6Lf8N5DaiZcDDYG',
  })
  public id: Hash

  @Expose()
  @ApiProperty({
    description: 'User first name',
    required: true,
    example: 'John',
  })
  public firstName: string

  @Expose()
  @ApiProperty({
    description: 'User last name',
    required: true,
    example: 'Doe',
  })
  public lastName: string

  @Expose()
  @ApiProperty({
    description: 'User email',
    required: true,
    example: 'john.doe@mail.com',
  })
  public email: string

  @Expose()
  @ApiProperty({
    description: 'User is verified status',
    required: true,
    example: true,
  })
  public isVerified: boolean

  @Expose()
  @ApiProperty({
    description: 'User is admin status',
    required: true,
    example: false,
  })
  public isAdmin: boolean

  @Expose()
  @ApiProperty({
    description: 'User is blocked status',
    required: true,
    example: false,
  })
  public isBlocked: boolean

  public constructor(user: Partial<User>) {
    const { role, status } = user
    Object.assign(this, user)
    this.isAdmin = role === UserRole.ADMIN
    this.isVerified = status === UserStatus.ACTIVE
    this.isBlocked = status === UserStatus.BLOCKED
  }

  public static from(user: Partial<User>): UserApiModel {
    return new this(user)
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
