import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode, User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthUser, Language } from '@common/decorator'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { PaginatedShoppingListsApiModel, ShoppingListApiModel } from '../api-model'
import {
  GenerateShoppingListDocs,
  GetShoppingListByIdDocs,
  GetShoppingListDocs,
  UpdateShoppingListItemDocs,
} from '../docs'
import { GenerateShoppingListDto, ShoppingListQueryDto, UpdateShoppingListItemDto } from '../dto'
import { ShoppingListService } from '../service'

@ApiTags('Shopping lists')
@ApiExtraModels(PaginatedShoppingListsApiModel, ShoppingListApiModel)
@Controller('shopping-lists')
export class ShoppingListController {
  public constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post('generate')
  @Authorization()
  @HttpCode(HttpStatus.CREATED)
  @GenerateShoppingListDocs()
  public async generateShoppingList(
    @AuthUser() user: User,
    @Body() dto: GenerateShoppingListDto,
    @Language() languageCode: LanguageCode,
  ): Promise<ShoppingListApiModel> {
    return this.shoppingListService.generateShoppingList(user, dto, languageCode)
  }

  @Get()
  @Authorization()
  @GetShoppingListDocs()
  public async getShoppingList(
    @AuthUser() user: User,
    @Query() query: ShoppingListQueryDto,
  ): Promise<PaginatedShoppingListsApiModel> {
    return this.shoppingListService.getPaginatedShoppingLists(query, user)
  }

  @Get(':id')
  @Authorization()
  @GetShoppingListByIdDocs()
  public async getShoppingListById(
    @Param('id', HashToUuidPipe) id: Uuid,
    @AuthUser() user: User,
    @Language() languageCode: LanguageCode,
  ): Promise<ShoppingListApiModel> {
    return this.shoppingListService.getShoppingListById(id, user, languageCode)
  }

  @Patch(':id/items/:itemId')
  @Authorization()
  @UpdateShoppingListItemDocs()
  public async updateShoppingListItem(
    @Param('id', HashToUuidPipe) shoppingListId: Uuid,
    @Param('itemId', HashToUuidPipe) itemId: Uuid,
    @AuthUser() user: User,
    @Body() dto: UpdateShoppingListItemDto,
    @Language() languageCode: LanguageCode,
  ): Promise<ShoppingListApiModel> {
    return this.shoppingListService.updateShoppingListItem(shoppingListId, itemId, user, dto, languageCode)
  }
}
