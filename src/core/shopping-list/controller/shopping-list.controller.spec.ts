import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ShoppingListController } from './shopping-list.controller'

describe('ShoppingListController', () => {
  const shoppingListService: any = {
    generateShoppingList: jest.fn(),
    getPaginatedShoppingLists: jest.fn(),
    getShoppingListById: jest.fn(),
    updateShoppingListItem: jest.fn(),
  }

  let controller: ShoppingListController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new ShoppingListController(shoppingListService)
  })

  it('should delegate all shopping list operations', async () => {
    const user = { id: 'user-1' }

    shoppingListService.generateShoppingList.mockResolvedValue({ id: 'list-1' })
    shoppingListService.getPaginatedShoppingLists.mockResolvedValue({ items: [] })
    shoppingListService.getShoppingListById.mockResolvedValue({ id: 'list-1' })
    shoppingListService.updateShoppingListItem.mockResolvedValue({ id: 'list-1' })

    await controller.generateShoppingList(user as never, { recipeIds: ['id'] } as never, 'EN' as never)
    await controller.getShoppingList(user as never, {} as never)
    await controller.getShoppingListById('list-1' as never, user as never, 'EN' as never)
    await controller.updateShoppingListItem(
      'list-1' as never,
      'item-1' as never,
      user as never,
      { status: 'COMPLETED' } as never,
      'EN' as never,
    )

    expect(shoppingListService.generateShoppingList).toHaveBeenCalled()
    expect(shoppingListService.getPaginatedShoppingLists).toHaveBeenCalledWith({}, user)
    expect(shoppingListService.getShoppingListById).toHaveBeenCalledWith('list-1', user, 'EN')
    expect(shoppingListService.updateShoppingListItem).toHaveBeenCalledWith(
      'list-1',
      'item-1',
      user,
      { status: 'COMPLETED' },
      'EN',
    )
  })
})
