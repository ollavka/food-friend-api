import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { LanguageCode, UserRole } from '@prisma/client'
import { AuthController } from '@core/auth/controller'
import { AuthService } from '@core/auth/service'
import { BackgroundJobController } from '@core/background-job/controller'
import { BackgroundJobService } from '@core/background-job/service'
import { ProductController } from '@core/product/controller'
import { ProductService } from '@core/product/service'
import { RecipeController } from '@core/recipe/controller'
import { RecipeAiService, RecipeService } from '@core/recipe/service'
import { SearchController } from '@core/search/controller'
import { SearchService } from '@core/search/service'
import { ShoppingListController } from '@core/shopping-list/controller'
import { ShoppingListService } from '@core/shopping-list/service'
import { UserController } from '@core/user/controller'
import { UserService } from '@core/user/service'

describe('Application contract e2e', () => {
  let moduleFixture: TestingModule

  let authController: AuthController
  let productController: ProductController
  let recipeController: RecipeController
  let shoppingListController: ShoppingListController
  let searchController: SearchController
  let backgroundJobController: BackgroundJobController
  let userController: UserController

  const authServiceMock = {
    register: async () => ({ ticket: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    login: async () => ({ accessToken: 'access-token', user: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' } }),
    logout: async () => null,
    refresh: async () => ({ accessToken: 'access-token', user: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' } }),
  }

  const productServiceMock = {
    getPaginatedProducts: async () => ({
      items: [],
      meta: { totalItems: 0, page: 1, perPage: 10, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    }),
    getProductById: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    createProduct: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    updateProduct: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    removeProduct: async () => null,
  }

  const recipeServiceMock = {
    getPaginatedRecipes: async () => ({
      items: [],
      meta: { totalItems: 0, page: 1, perPage: 10, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    }),
    getPaginatedFavoriteRecipes: async () => ({
      items: [],
      meta: { totalItems: 0, page: 1, perPage: 10, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    }),
    getRecipeRecommendations: async () => ({ items: [] }),
    getPantryMatchRecipes: async () => ({ items: [] }),
    createRecipe: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    updateRecipe: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    archiveRecipe: async () => null,
    addRecipeLike: async () => null,
    removeRecipeLike: async () => null,
    addRecipeFavorite: async () => null,
    removeRecipeFavorite: async () => null,
    getRecipeSubstitutions: async () => ({ items: [] }),
    getRecipeById: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
  }

  const recipeAiServiceMock = {
    createRecipeFromPhotoJob: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp', status: 'PENDING' }),
    createRecipeImageJob: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp', status: 'PENDING' }),
  }

  const shoppingListServiceMock = {
    generateShoppingList: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    getPaginatedShoppingLists: async () => ({
      items: [],
      meta: { totalItems: 0, page: 1, perPage: 10, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    }),
    getShoppingListById: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
    updateShoppingListItem: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp' }),
  }

  const searchServiceMock = {
    searchProducts: async () => ({
      items: [],
      meta: { totalItems: 0, page: 1, perPage: 10, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    }),
    searchRecipes: async () => ({
      items: [],
      meta: { totalItems: 0, page: 1, perPage: 10, pageCount: 1, hasNextPage: false, hasPrevPage: false },
    }),
    createReindexJobs: async () => [{ id: 'LnT8BAUhhoJ2Y6MuB9AAZp', status: 'PENDING' }],
  }

  const backgroundJobServiceMock = {
    getBackgroundJobById: async () => ({ id: 'LnT8BAUhhoJ2Y6MuB9AAZp', status: 'PENDING' }),
  }

  const userServiceMock = {
    findById: async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'user@example.com' }),
    upsertNutritionProfile: async () => ({
      id: '11111111-1111-4111-8111-111111111111',
      userId: '11111111-1111-4111-8111-111111111111',
      sex: 'MALE',
      age: 30,
      heightCm: 180,
      weightKg: 75,
      activityLevel: 'MODERATE',
      goal: 'MAINTAIN_WEIGHT',
      targetCalories: 2200,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      controllers: [
        AuthController,
        ProductController,
        RecipeController,
        ShoppingListController,
        SearchController,
        BackgroundJobController,
        UserController,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: RecipeService, useValue: recipeServiceMock },
        { provide: RecipeAiService, useValue: recipeAiServiceMock },
        { provide: ShoppingListService, useValue: shoppingListServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        { provide: BackgroundJobService, useValue: backgroundJobServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile()

    authController = moduleFixture.get(AuthController)
    productController = moduleFixture.get(ProductController)
    recipeController = moduleFixture.get(RecipeController)
    shoppingListController = moduleFixture.get(ShoppingListController)
    searchController = moduleFixture.get(SearchController)
    backgroundJobController = moduleFixture.get(BackgroundJobController)
    userController = moduleFixture.get(UserController)
  })

  afterAll(async () => {
    await moduleFixture.close()
  })

  it('should execute auth register contract', async () => {
    const result = await authController.register({
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'StrongPassword123',
    } as never)

    expect(result.ticket).toBeDefined()
  })

  it('should execute products list contract', async () => {
    const result = await productController.getProductList(LanguageCode.EN, {} as never)
    expect(result.items).toEqual([])
  })

  it('should execute recipes ai create-from-photo contract', async () => {
    const result = await recipeController.createRecipeFromPhoto(
      {
        id: '11111111-1111-4111-8111-111111111111',
        role: UserRole.REGULAR,
      } as never,
      LanguageCode.EN,
      {
        imageUrl: 'https://example.com/food.jpg',
      } as never,
      undefined,
    )

    expect(result.status).toBe('PENDING')
  })

  it('should execute shopping list generation contract', async () => {
    const result = await shoppingListController.generateShoppingList(
      {
        id: '11111111-1111-4111-8111-111111111111',
        role: UserRole.REGULAR,
      } as never,
      {
        recipeIds: ['LnT8BAUhhoJ2Y6MuB9AAZp'],
      } as never,
      LanguageCode.EN,
    )

    expect(result.id).toBeDefined()
  })

  it('should execute search products contract', async () => {
    const result = await searchController.searchProducts(LanguageCode.EN, {} as never)
    expect(result.meta.totalItems).toBe(0)
  })

  it('should execute background job polling contract', async () => {
    const result = await backgroundJobController.getBackgroundJobById(
      '11111111-1111-4111-8111-111111111111' as never,
      {
        id: '11111111-1111-4111-8111-111111111111',
        role: UserRole.REGULAR,
      } as never,
    )

    expect(result.status).toBe('PENDING')
  })

  it('should execute users me contract', () => {
    const result = userController.getMe({
      id: '11111111-1111-4111-8111-111111111111',
      email: 'user@example.com',
      role: UserRole.REGULAR,
    } as never)

    expect(result.id).toBeDefined()
  })
})
