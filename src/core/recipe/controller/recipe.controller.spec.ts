import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { RecipeController } from './recipe.controller'

describe('RecipeController', () => {
  const recipeService: any = {
    getPaginatedRecipes: jest.fn(),
    getPaginatedFavoriteRecipes: jest.fn(),
    getRecipeRecommendations: jest.fn(),
    getPantryMatchRecipes: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    archiveRecipe: jest.fn(),
    addRecipeLike: jest.fn(),
    removeRecipeLike: jest.fn(),
    addRecipeFavorite: jest.fn(),
    removeRecipeFavorite: jest.fn(),
    getRecipeSubstitutions: jest.fn(),
    getRecipeById: jest.fn(),
  }

  const recipeAiService: any = {
    createRecipeFromPhotoJob: jest.fn(),
    createRecipeImageJob: jest.fn(),
  }

  let controller: RecipeController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RecipeController(recipeService, recipeAiService)
  })

  it('should delegate read operations', async () => {
    recipeService.getPaginatedRecipes.mockResolvedValue({ items: [] })
    recipeService.getPaginatedFavoriteRecipes.mockResolvedValue({ items: [] })
    recipeService.getRecipeRecommendations.mockResolvedValue({ items: [] })
    recipeService.getPantryMatchRecipes.mockResolvedValue({ items: [] })
    recipeService.getRecipeById.mockResolvedValue({ id: 'recipe-1' })

    await controller.getRecipeList('EN' as never, {} as never)
    await controller.getFavoriteRecipeList({ id: 'user-1' } as never, 'EN' as never, {} as never)
    await controller.getRecipeRecommendations({ id: 'user-1' } as never, 'EN' as never, {} as never)
    await controller.getPantryMatchRecipes({ id: 'user-1' } as never, 'EN' as never, { items: [] } as never)
    await controller.getRecipeById('recipe-1' as never, 'EN' as never)

    expect(recipeService.getPaginatedRecipes).toHaveBeenCalled()
    expect(recipeService.getPaginatedFavoriteRecipes).toHaveBeenCalled()
    expect(recipeService.getRecipeRecommendations).toHaveBeenCalled()
    expect(recipeService.getPantryMatchRecipes).toHaveBeenCalled()
    expect(recipeService.getRecipeById).toHaveBeenCalledWith('recipe-1', 'EN', undefined, { incrementViews: true })
  })

  it('should delegate write and interaction operations', async () => {
    const user = { id: 'user-1' }

    recipeService.createRecipe.mockResolvedValue({ id: 'recipe-1' })
    recipeService.updateRecipe.mockResolvedValue({ id: 'recipe-1' })
    recipeService.archiveRecipe.mockResolvedValue(null)
    recipeService.addRecipeLike.mockResolvedValue(null)
    recipeService.removeRecipeLike.mockResolvedValue(null)
    recipeService.addRecipeFavorite.mockResolvedValue(null)
    recipeService.removeRecipeFavorite.mockResolvedValue(null)
    recipeService.getRecipeSubstitutions.mockResolvedValue({ items: [] })

    await controller.createRecipe(user as never, { title: 'R' } as never, 'EN' as never)
    await controller.updateRecipe('recipe-1' as never, user as never, { title: 'R' } as never, 'EN' as never)
    await controller.archiveRecipe('recipe-1' as never, user as never)
    await controller.addRecipeLike('recipe-1' as never, user as never)
    await controller.removeRecipeLike('recipe-1' as never, user as never)
    await controller.addRecipeFavorite('recipe-1' as never, user as never)
    await controller.removeRecipeFavorite('recipe-1' as never, user as never)
    await controller.getRecipeSubstitutions('recipe-1' as never, user as never, 'EN' as never, {} as never)

    expect(recipeService.createRecipe).toHaveBeenCalled()
    expect(recipeService.updateRecipe).toHaveBeenCalled()
    expect(recipeService.archiveRecipe).toHaveBeenCalledWith('recipe-1', user)
    expect(recipeService.addRecipeLike).toHaveBeenCalledWith('recipe-1', user)
    expect(recipeService.removeRecipeLike).toHaveBeenCalledWith('recipe-1', user)
    expect(recipeService.addRecipeFavorite).toHaveBeenCalledWith('recipe-1', user)
    expect(recipeService.removeRecipeFavorite).toHaveBeenCalledWith('recipe-1', user)
    expect(recipeService.getRecipeSubstitutions).toHaveBeenCalled()
  })

  it('should delegate ai operations', async () => {
    recipeAiService.createRecipeFromPhotoJob.mockResolvedValue({ id: 'job-1' })
    recipeAiService.createRecipeImageJob.mockResolvedValue({ id: 'job-2' })

    const user = { id: 'user-1' }

    const fromPhoto = await controller.createRecipeFromPhoto(
      user as never,
      'EN' as never,
      { imageUrl: 'https://example.com/a.png' } as never,
      undefined,
    )
    const generatedImage = await controller.createRecipeImage(
      user as never,
      'EN' as never,
      { recipeId: 'hash' } as never,
    )

    expect(fromPhoto).toEqual({ id: 'job-1' })
    expect(generatedImage).toEqual({ id: 'job-2' })
    expect(recipeAiService.createRecipeFromPhotoJob).toHaveBeenCalled()
    expect(recipeAiService.createRecipeImageJob).toHaveBeenCalled()
  })
})
