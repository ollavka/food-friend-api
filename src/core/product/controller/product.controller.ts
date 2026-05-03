import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode, User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthUser, Language } from '@common/decorator'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { PaginatedProductsApiModel, ProductApiModel } from '../api-model'
import {
  CreateProductDocs,
  GetProductByIdDocs,
  GetProductListDocs,
  RemoveProductDocs,
  UpdateProductDocs,
} from '../docs'
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from '../dto'
import { ProductService } from '../service'

@ApiTags('Products')
@ApiExtraModels(PaginatedProductsApiModel, ProductApiModel)
@Controller('products')
export class ProductController {
  public constructor(private readonly productService: ProductService) {}

  @Get()
  @GetProductListDocs()
  public async getProductList(
    @Language() languageCode: LanguageCode,
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductsApiModel> {
    return this.productService.getPaginatedProducts(query, languageCode)
  }

  @Get(':id')
  @GetProductByIdDocs()
  public async getProductById(
    @Param('id', HashToUuidPipe) id: Uuid,
    @Language() languageCode: LanguageCode,
  ): Promise<ProductApiModel> {
    return this.productService.getProductById(id, languageCode)
  }

  @Post()
  @Authorization()
  @HttpCode(HttpStatus.CREATED)
  @CreateProductDocs()
  public async createProduct(
    @AuthUser() user: User,
    @Body() dto: CreateProductDto,
    @Language() languageCode: LanguageCode,
  ): Promise<ProductApiModel> {
    return this.productService.createProduct(user, dto, languageCode)
  }

  @Patch(':id')
  @Authorization()
  @UpdateProductDocs()
  public async updateProduct(
    @Param('id', HashToUuidPipe) id: Uuid,
    @AuthUser() user: User,
    @Body() dto: UpdateProductDto,
    @Language() languageCode: LanguageCode,
  ): Promise<ProductApiModel> {
    return this.productService.updateProduct(id, user, dto, languageCode)
  }

  @Delete(':id')
  @Authorization()
  @RemoveProductDocs()
  public async removeProduct(@Param('id', HashToUuidPipe) id: Uuid, @AuthUser() user: User): Promise<null> {
    return this.productService.removeProduct(id, user)
  }
}
