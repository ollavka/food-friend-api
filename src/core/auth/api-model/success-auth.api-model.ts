import { ApiProperty, PickType } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { UserApiModel } from '@core/user/api-model'
import { AuthTokensApiModel } from './auth-tokens.api-model'

@Exclude()
export class SuccessAuthApiModel extends PickType(AuthTokensApiModel, ['accessToken'] as const) {
  @Expose()
  @ApiProperty({
    description: 'Authorized user',
    type: () => UserApiModel,
  })
  @ValidateNested()
  @Type(() => UserApiModel)
  public user: UserApiModel

  public constructor(data: Partial<{ accessToken: string; user: User }>) {
    super()
    const user = data?.user ? UserApiModel.from(data.user) : undefined
    Object.assign(this, { ...data, user })
  }

  public static from(data: Partial<{ accessToken: string; user: User }>): SuccessAuthApiModel {
    return new this(data)
  }
}
