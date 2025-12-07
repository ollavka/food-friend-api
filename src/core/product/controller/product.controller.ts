import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode } from '@prisma/client'
import { Language } from '@common/decorator'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { PaginatedProductsApiModel, ProductApiModel } from '../api-model'
import { GetProductByIdDocs, GetProductListDocs } from '../docs'
import { ProductQueryDto } from '../dto'
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
}
