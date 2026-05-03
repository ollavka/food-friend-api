import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ProductController } from './product.controller'

describe('ProductController', () => {
  const productService: any = {
    getPaginatedProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    removeProduct: jest.fn(),
  }

  let controller: ProductController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new ProductController(productService)
  })

  it('should delegate getProductList', async () => {
    productService.getPaginatedProducts.mockResolvedValue({ items: [], meta: {} })

    const result = await controller.getProductList('EN' as never, {} as never)

    expect(result).toEqual({ items: [], meta: {} })
    expect(productService.getPaginatedProducts).toHaveBeenCalledWith({}, 'EN')
  })

  it('should delegate getProductById', async () => {
    productService.getProductById.mockResolvedValue({ id: 'product-1' })

    const result = await controller.getProductById('product-1' as never, 'EN' as never)

    expect(result).toEqual({ id: 'product-1' })
  })

  it('should delegate create/update/remove', async () => {
    const user = { id: 'user-1' }

    productService.createProduct.mockResolvedValue({ id: 'product-1' })
    productService.updateProduct.mockResolvedValue({ id: 'product-1' })
    productService.removeProduct.mockResolvedValue(null)

    await controller.createProduct(user as never, { name: 'Tomato' } as never, 'EN' as never)
    await controller.updateProduct('product-1' as never, user as never, { name: 'Tomato' } as never, 'EN' as never)
    await controller.removeProduct('product-1' as never, user as never)

    expect(productService.createProduct).toHaveBeenCalled()
    expect(productService.updateProduct).toHaveBeenCalled()
    expect(productService.removeProduct).toHaveBeenCalledWith('product-1', user)
  })
})
