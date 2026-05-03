import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode, User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthUser, FileUpload, Language } from '@common/decorator'
import { HashToUuidPipe } from '@common/pipe'
import { MulterFile, Uuid } from '@common/type'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
import {
  PaginatedRecipesApiModel,
  PantryMatchRecipesApiModel,
  RecipeApiModel,
  RecipeRecommendationsApiModel,
  RecipeSubstitutionsApiModel,
} from '../api-model'
import {
  AddRecipeFavoriteDocs,
  AddRecipeLikeDocs,
  ArchiveRecipeDocs,
  CreateRecipeDocs,
  CreateRecipeFromPhotoAiDocs,
  CreateRecipeImageAiDocs,
  GetFavoriteRecipeListDocs,
  GetPantryMatchRecipesDocs,
  GetRecipeByIdDocs,
  GetRecipeListDocs,
  GetRecipeRecommendationsDocs,
  GetRecipeSubstitutionsDocs,
  RemoveRecipeFavoriteDocs,
  RemoveRecipeLikeDocs,
  UpdateRecipeDocs,
} from '../docs'
import {
  CreateRecipeDto,
  CreateRecipeFromPhotoDto,
  CreateRecipeImageDto,
  PantryMatchDto,
  RecipeQueryDto,
  RecipeRecommendationsQueryDto,
  RecipeSubstitutionsDto,
  UpdateRecipeDto,
} from '../dto'
import { RecipeAiService, RecipeService } from '../service'

@ApiTags('Recipes')
@ApiExtraModels(
  PaginatedRecipesApiModel,
  RecipeApiModel,
  RecipeRecommendationsApiModel,
  PantryMatchRecipesApiModel,
  RecipeSubstitutionsApiModel,
  BackgroundJobApiModel,
)
@Controller('recipes')
export class RecipeController {
  public constructor(
    private readonly recipeService: RecipeService,
    private readonly recipeAiService: RecipeAiService,
  ) {}

  @Get()
  @GetRecipeListDocs()
  public async getRecipeList(
    @Language() languageCode: LanguageCode,
    @Query() query: RecipeQueryDto,
  ): Promise<PaginatedRecipesApiModel> {
    return this.recipeService.getPaginatedRecipes(query, languageCode)
  }

  @Get('favorites')
  @Authorization()
  @GetFavoriteRecipeListDocs()
  public async getFavoriteRecipeList(
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
    @Query() query: RecipeQueryDto,
  ): Promise<PaginatedRecipesApiModel> {
    return this.recipeService.getPaginatedFavoriteRecipes(query, languageCode, user)
  }

  @Get('ai/recommendations')
  @Authorization()
  @GetRecipeRecommendationsDocs()
  public async getRecipeRecommendations(
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
    @Query() query: RecipeRecommendationsQueryDto,
  ): Promise<RecipeRecommendationsApiModel> {
    return this.recipeService.getRecipeRecommendations(user, languageCode, query)
  }

  @Post('ai/pantry-match')
  @Authorization()
  @GetPantryMatchRecipesDocs()
  public async getPantryMatchRecipes(
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
    @Body() dto: PantryMatchDto,
  ): Promise<PantryMatchRecipesApiModel> {
    return this.recipeService.getPantryMatchRecipes(user, languageCode, dto)
  }

  @Post()
  @Authorization()
  @HttpCode(HttpStatus.CREATED)
  @CreateRecipeDocs()
  public async createRecipe(
    @AuthUser() user: User,
    @Body() dto: CreateRecipeDto,
    @Language() languageCode: LanguageCode,
  ): Promise<RecipeApiModel> {
    return this.recipeService.createRecipe(user, dto, languageCode)
  }

  @Patch(':id')
  @Authorization()
  @UpdateRecipeDocs()
  public async updateRecipe(
    @Param('id', HashToUuidPipe) id: Uuid,
    @AuthUser() user: User,
    @Body() dto: UpdateRecipeDto,
    @Language() languageCode: LanguageCode,
  ): Promise<RecipeApiModel> {
    return this.recipeService.updateRecipe(id, user, dto, languageCode)
  }

  @Delete(':id')
  @Authorization()
  @ArchiveRecipeDocs()
  public async archiveRecipe(@Param('id', HashToUuidPipe) id: Uuid, @AuthUser() user: User): Promise<null> {
    return this.recipeService.archiveRecipe(id, user)
  }

  @Post(':id/likes')
  @Authorization()
  @AddRecipeLikeDocs()
  public async addRecipeLike(@Param('id', HashToUuidPipe) id: Uuid, @AuthUser() user: User): Promise<null> {
    return this.recipeService.addRecipeLike(id, user)
  }

  @Delete(':id/likes')
  @Authorization()
  @RemoveRecipeLikeDocs()
  public async removeRecipeLike(@Param('id', HashToUuidPipe) id: Uuid, @AuthUser() user: User): Promise<null> {
    return this.recipeService.removeRecipeLike(id, user)
  }

  @Post(':id/favorites')
  @Authorization()
  @AddRecipeFavoriteDocs()
  public async addRecipeFavorite(@Param('id', HashToUuidPipe) id: Uuid, @AuthUser() user: User): Promise<null> {
    return this.recipeService.addRecipeFavorite(id, user)
  }

  @Delete(':id/favorites')
  @Authorization()
  @RemoveRecipeFavoriteDocs()
  public async removeRecipeFavorite(@Param('id', HashToUuidPipe) id: Uuid, @AuthUser() user: User): Promise<null> {
    return this.recipeService.removeRecipeFavorite(id, user)
  }

  @Post('ai/:id/substitutions')
  @Authorization()
  @GetRecipeSubstitutionsDocs()
  public async getRecipeSubstitutions(
    @Param('id', HashToUuidPipe) id: Uuid,
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
    @Body() dto: RecipeSubstitutionsDto,
  ): Promise<RecipeSubstitutionsApiModel> {
    return this.recipeService.getRecipeSubstitutions(id, user, languageCode, dto)
  }

  @Post('ai/create-from-photo')
  @Authorization()
  @HttpCode(HttpStatus.ACCEPTED)
  @FileUpload('photo')
  @CreateRecipeFromPhotoAiDocs()
  public async createRecipeFromPhoto(
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
    @Body() dto: CreateRecipeFromPhotoDto,
    @UploadedFile() file?: MulterFile,
  ): Promise<BackgroundJobApiModel> {
    return this.recipeAiService.createRecipeFromPhotoJob(user, languageCode, dto, file)
  }

  @Post('ai/generate-image')
  @Authorization()
  @HttpCode(HttpStatus.ACCEPTED)
  @CreateRecipeImageAiDocs()
  public async createRecipeImage(
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
    @Body() dto: CreateRecipeImageDto,
  ): Promise<BackgroundJobApiModel> {
    return this.recipeAiService.createRecipeImageJob(user, languageCode, dto)
  }

  @Get(':id')
  @GetRecipeByIdDocs()
  public async getRecipeById(
    @Param('id', HashToUuidPipe) id: Uuid,
    @Language() languageCode: LanguageCode,
  ): Promise<RecipeApiModel> {
    return this.recipeService.getRecipeById(id, languageCode, undefined, { incrementViews: true })
  }
}
