import { ApiProperty } from '@nestjs/swagger'
import { BackgroundJobStatus, BackgroundJobType } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { BackgroundJobDetails } from '../type'

@Exclude()
export class BackgroundJobApiModel {
  @Expose()
  @ToId()
  @ApiProperty({
    description: 'Background job ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public id: Hash

  @Expose()
  @ApiProperty({
    description: 'Background job type',
    enum: BackgroundJobType,
    required: true,
  })
  public type: BackgroundJobType

  @Expose()
  @ApiProperty({
    description: 'Background job status',
    enum: BackgroundJobStatus,
    required: true,
  })
  public status: BackgroundJobStatus

  @Expose()
  @ApiProperty({
    description: 'Current attempts count',
    example: 1,
    required: true,
  })
  public attempts: number

  @Expose()
  @ApiProperty({
    description: 'Maximum attempts count',
    example: 3,
    required: true,
  })
  public maxAttempts: number

  @Expose()
  @ApiProperty({
    description: 'Next run time',
    example: new Date(),
    required: true,
  })
  public runAt: Date

  @Expose()
  @ApiProperty({
    description: 'Job processing start time',
    example: new Date(),
    required: false,
    nullable: true,
  })
  public startedAt?: Date | null

  @Expose()
  @ApiProperty({
    description: 'Job processing finish time',
    example: new Date(),
    required: false,
    nullable: true,
  })
  public finishedAt?: Date | null

  @Expose()
  @ApiProperty({
    description: 'Job result payload',
    required: false,
    nullable: true,
  })
  public result?: unknown

  @Expose()
  @ApiProperty({
    description: 'Job error payload',
    required: false,
    nullable: true,
  })
  public error?: unknown

  @Expose()
  @ApiProperty({
    description: 'Job created at date',
    example: new Date(),
    required: true,
  })
  public createdAt: Date

  @Expose()
  @ApiProperty({
    description: 'Job updated at date',
    example: new Date(),
    required: true,
  })
  public updatedAt: Date

  public constructor(job: BackgroundJobDetails) {
    Object.assign(this, job)
  }

  public static from(job: BackgroundJobDetails): BackgroundJobApiModel {
    return new this(job)
  }
}
