import { ApiProperty } from '@nestjs/swagger'
import { ResetPasswordSession } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { ToId } from '@common/validation'

@Exclude()
export class ResetPasswordSessionApiModel {
  @Expose()
  @ToId()
  @ApiProperty({
    description: 'Reset password session ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public sessionId: string

  @Expose()
  @ApiProperty({
    description: 'Session expires at (Date Time)',
    example: new Date(),
    required: true,
  })
  public expiresAt: Date

  public constructor(session: ResetPasswordSession) {
    this.sessionId = session.id
    this.expiresAt = session.expiresAt
  }

  public static from(session: ResetPasswordSession): ResetPasswordSessionApiModel {
    return new this(session)
  }
}
