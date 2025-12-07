import { Injectable } from '@nestjs/common'
import { Language, LanguageCode } from '@prisma/client'
import { AppEntityNotFoundException } from '@common/exception'
import { PaginatedResult, Uuid } from '@common/type'
import { LanguageService } from '@core/language'
import { PaginationService } from '@infrastructure/pagination'
import { PaginatedProductsApiModel, ProductApiModel } from '../api-model'
import { ProductQueryDto } from '../dto'
import { ProductRepository } from '../repository'
import { ProductWithTranslation } from '../type'

@Injectable()
export class ProductService {
  public constructor(
    private readonly productRepository: ProductRepository,
    private readonly languageService: LanguageService,
    private readonly paginationService: PaginationService,
  ) {}

  public async getProductById(id: Uuid, languageCode: LanguageCode): Promise<ProductApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const product = await this.productRepository.findProductById(id, language)

    if (!product) {
      throw AppEntityNotFoundException.byId('Product', id)
    }

    return ProductApiModel.from(product)
  }

  public async getPaginatedProducts(
    query: ProductQueryDto,
    languageCode: LanguageCode,
  ): Promise<PaginatedProductsApiModel> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const paginatedProducts = await this.findPaginatedProducts(query, language)
    const productsModel = ProductApiModel.fromList(paginatedProducts.items)
    return {
      items: productsModel,
      meta: paginatedProducts.meta,
    }
  }

  private async findPaginatedProducts(
    query: ProductQueryDto,
    language: Language,
  ): Promise<PaginatedResult<ProductWithTranslation>> {
    const { filter, pagination } = query
    const where = this.productRepository.prepareProductWhereInput(filter ?? {}, language)
    const sort = this.productRepository.prepareProductSortInput(query.sort)

    const paginatedProducts = await this.paginationService.paginate<ProductWithTranslation>({
      ...(pagination ?? {}),
      countFn: () => this.productRepository.getTotalProductsCount(where),
      itemsFn: (skip, take) => this.productRepository.getPaginatedProductItems(where, sort ?? {}, skip, take, language),
    })

    return paginatedProducts
  }
}
