import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode, User, UserRole } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthUser, Language } from '@common/decorator'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
import { PaginatedSearchProductsApiModel, PaginatedSearchRecipesApiModel } from '../api-model'
import { SearchProductsDocs, SearchRecipesDocs, SearchReindexDocs } from '../docs'
import { SearchProductQueryDto, SearchRecipeQueryDto, SearchReindexDto } from '../dto'
import { SearchService } from '../service'

@ApiTags('Search')
@ApiExtraModels(PaginatedSearchProductsApiModel, PaginatedSearchRecipesApiModel, BackgroundJobApiModel)
@Controller('search')
export class SearchController {
  public constructor(private readonly searchService: SearchService) {}

  @Get('products')
  @SearchProductsDocs()
  public async searchProducts(
    @Language() languageCode: LanguageCode,
    @Query() query: SearchProductQueryDto,
  ): Promise<PaginatedSearchProductsApiModel> {
    return this.searchService.searchProducts(query, languageCode)
  }

  @Get('recipes')
  @SearchRecipesDocs()
  public async searchRecipes(
    @Language() languageCode: LanguageCode,
    @Query() query: SearchRecipeQueryDto,
  ): Promise<PaginatedSearchRecipesApiModel> {
    return this.searchService.searchRecipes(query, languageCode)
  }

  @Post('reindex')
  @Authorization({ roles: [UserRole.ADMIN] })
  @HttpCode(HttpStatus.ACCEPTED)
  @SearchReindexDocs()
  public async reindexSearch(@AuthUser() user: User, @Body() dto?: SearchReindexDto): Promise<BackgroundJobApiModel[]> {
    return this.searchService.createReindexJobs(user, dto)
  }
}
