import { User, UserRole } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { ToId } from '@common/validation'

@Exclude()
export class UserEntity {
  @Expose()
  @ToId()
  public id: string

  @Expose()
  public firstName: string

  @Expose()
  public email: string

  @Expose()
  public isVerified: boolean

  @Expose()
  public lastName: string

  @Expose()
  public role: UserRole

  public constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }

  public static from(data: Partial<User>): UserEntity {
    return new this(data)
  }
}
