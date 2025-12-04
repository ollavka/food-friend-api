import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode, UserRole } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { Language } from '@common/decorator'
import { ResourceIdDto } from '@common/dto'
import { LanguageApiModel } from '../api-model'
import { GetLanguageListDocs } from '../docs'
import { LanguageService } from '../service'

@ApiTags('Languages')
@ApiExtraModels(LanguageApiModel)
@Controller('languages')
export class LanguageController {
  public constructor(private readonly languageService: LanguageService) {}

  @Get()
  @GetLanguageListDocs()
  public async getLanguageList(@Language() languageCode: LanguageCode): Promise<LanguageApiModel[]> {
    return this.languageService.getAllLanguages(languageCode)
  }

  @ApiExcludeEndpoint()
  @Authorization({ roles: [UserRole.ADMIN] })
  @Post('set-default')
  public async setDefaultLanguage(@Body() { id }: ResourceIdDto): Promise<boolean> {
    await this.languageService.setDefaultLanguage(id)
    return true
  }
}
