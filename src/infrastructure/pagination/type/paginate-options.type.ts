export interface PaginateOptions<T> {
  page?: number
  limit?: number
  countFn: () => Promise<number>
  itemsFn: (skip: number, take: number) => Promise<T[]>
}
