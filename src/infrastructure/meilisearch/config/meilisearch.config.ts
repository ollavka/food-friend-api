import { registerAs } from '@nestjs/config'
import { MEILISEARCH_ENV_CONFIG_KEY } from './constant'
import { MeilisearchEnvConfig } from './type'

export const meilisearchEnvConfig: () => MeilisearchEnvConfig = registerAs(MEILISEARCH_ENV_CONFIG_KEY, () => ({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
  productsIndexUid: process.env.MEILISEARCH_PRODUCTS_INDEX ?? 'food-friend-products',
  recipesIndexUid: process.env.MEILISEARCH_RECIPES_INDEX ?? 'food-friend-recipes',
}))
