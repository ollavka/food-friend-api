import { Controller, Get, Param } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthUser } from '@common/decorator'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { BackgroundJobApiModel } from '../api-model'
import { GetBackgroundJobByIdDocs } from '../docs'
import { BackgroundJobService } from '../service'

@ApiTags('AI')
@ApiExtraModels(BackgroundJobApiModel)
@Controller('ai/jobs')
export class BackgroundJobController {
  public constructor(private readonly backgroundJobService: BackgroundJobService) {}

  @Get(':jobId')
  @Authorization()
  @GetBackgroundJobByIdDocs()
  public async getBackgroundJobById(
    @Param('jobId', HashToUuidPipe) jobId: Uuid,
    @AuthUser() user: User,
  ): Promise<BackgroundJobApiModel> {
    return this.backgroundJobService.getBackgroundJobById(jobId, user)
  }
}
