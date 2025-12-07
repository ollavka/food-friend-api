import { Injectable } from '@nestjs/common'
import { PaginationMetaApiModel } from '@common/api-model'
import { PaginatedResult } from '@common/type'
import { PaginateOptions } from '../type'

@Injectable()
export class PaginationService {
  public async paginate<T>(options: PaginateOptions<T>): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, countFn, itemsFn } = options

    const [totalItems, items] = await Promise.all([countFn(), itemsFn((page - 1) * limit, limit)])
    const pageCount = Math.max(1, Math.ceil(totalItems / limit))

    const meta: PaginationMetaApiModel = {
      totalItems,
      page,
      perPage: limit,
      pageCount,
      hasNextPage: page < pageCount,
      hasPrevPage: page > 1,
    }

    return {
      items,
      meta,
    }
  }
}
