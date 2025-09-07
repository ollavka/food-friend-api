import { User, UserRole, UserStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { ToId } from '@common/validation'

@Exclude()
export class UserApiModel {
  @Expose()
  @ToId()
  public id: string

  @Expose()
  public firstName: string

  @Expose()
  public lastName: string

  @Expose()
  public email: string

  @Expose()
  public isVerified: boolean

  @Expose()
  public role: UserRole

  @Expose()
  public status: UserStatus

  public constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }

  public static from(data: Partial<User>): UserApiModel {
    return new this(data)
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
