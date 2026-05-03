-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShoppingListItemStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BackgroundJobType" AS ENUM (
  'PRODUCT_TRANSLATION',
  'RECIPE_TRANSLATION',
  'RECIPE_NUTRITION_ANALYSIS',
  'RECIPE_DRAFT_GENERATION',
  'RECIPE_IMAGE_ANALYSIS',
  'SEARCH_SYNC_RECIPE',
  'SEARCH_SYNC_PRODUCT',
  'SEARCH_REINDEX_RECIPES',
  'SEARCH_REINDEX_PRODUCTS'
);

-- CreateEnum
CREATE TYPE "BackgroundJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');

-- AlterTable
ALTER TABLE "products"
ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "image_key" TEXT,
ADD COLUMN "image_url" TEXT,
ADD COLUMN "owner_id" TEXT,
ADD COLUMN "source_language_id" TEXT,
ADD COLUMN "measurement_unit_id" TEXT;

-- AlterTable
ALTER TABLE "product_translations"
ADD COLUMN "description" TEXT,
ADD COLUMN "is_auto_translated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "recipes" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "RecipeStatus" NOT NULL DEFAULT 'DRAFT',
  "cooking_time_minutes" INTEGER NOT NULL DEFAULT 0,
  "servings" INTEGER,
  "image_key" TEXT,
  "image_url" TEXT,
  "likes_count" INTEGER NOT NULL DEFAULT 0,
  "favorites_count" INTEGER NOT NULL DEFAULT 0,
  "views_count" INTEGER NOT NULL DEFAULT 0,
  "published_at" TIMESTAMP(3),
  "source_language_id" TEXT,
  "difficulty_id" TEXT NOT NULL,
  "author_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_translations" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "is_auto_translated" BOOLEAN NOT NULL DEFAULT false,
  "language_id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipe_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_step_translations" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "is_auto_translated" BOOLEAN NOT NULL DEFAULT false,
  "language_id" TEXT NOT NULL,
  "step_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipe_step_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "measurement_unit_id" TEXT NOT NULL,
  "quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "note" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_nutritions" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "kcal" DECIMAL(65,30),
  "proteins" DECIMAL(65,30),
  "fats" DECIMAL(65,30),
  "carbs" DECIMAL(65,30),
  "fiber" DECIMAL(65,30),
  "sugar" DECIMAL(65,30),
  "sodium_mg" DECIMAL(65,30),
  "is_estimated" BOOLEAN NOT NULL DEFAULT false,
  "updated_by_ai_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipe_nutritions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_favorites" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recipe_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_likes" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recipe_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_lists" (
  "id" TEXT NOT NULL,
  "title" TEXT,
  "status" "ShoppingListStatus" NOT NULL DEFAULT 'ACTIVE',
  "user_id" TEXT NOT NULL,
  "source_language_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_recipes" (
  "id" TEXT NOT NULL,
  "shopping_list_id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "shopping_list_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_items" (
  "id" TEXT NOT NULL,
  "shopping_list_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "measurement_unit_id" TEXT NOT NULL,
  "quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "note" TEXT,
  "is_manual" BOOLEAN NOT NULL DEFAULT false,
  "status" "ShoppingListItemStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_jobs" (
  "id" TEXT NOT NULL,
  "type" "BackgroundJobType" NOT NULL,
  "status" "BackgroundJobStatus" NOT NULL DEFAULT 'PENDING',
  "payload" JSONB NOT NULL,
  "result" JSONB,
  "error" JSONB,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL DEFAULT 3,
  "run_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "started_at" TIMESTAMP(3),
  "finished_at" TIMESTAMP(3),
  "lock_expires_at" TIMESTAMP(3),
  "locked_by" TEXT,
  "dedup_key" TEXT,
  "recipe_id" TEXT,
  "user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_is_system_idx" ON "products"("is_system");

-- CreateIndex
CREATE INDEX "products_owner_id_idx" ON "products"("owner_id");

-- CreateIndex
CREATE INDEX "products_source_language_id_idx" ON "products"("source_language_id");

-- CreateIndex
CREATE INDEX "products_measurement_unit_id_idx" ON "products"("measurement_unit_id");

-- CreateIndex
CREATE INDEX "product_translations_language_id_idx" ON "product_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");

-- CreateIndex
CREATE INDEX "recipes_status_idx" ON "recipes"("status");

-- CreateIndex
CREATE INDEX "recipes_author_id_idx" ON "recipes"("author_id");

-- CreateIndex
CREATE INDEX "recipes_difficulty_id_idx" ON "recipes"("difficulty_id");

-- CreateIndex
CREATE INDEX "recipes_source_language_id_idx" ON "recipes"("source_language_id");

-- CreateIndex
CREATE INDEX "recipes_created_at_idx" ON "recipes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_translations_recipe_id_language_id_key" ON "recipe_translations"("recipe_id", "language_id");

-- CreateIndex
CREATE INDEX "recipe_translations_language_id_idx" ON "recipe_translations"("language_id");

-- CreateIndex
CREATE INDEX "recipe_translations_title_idx" ON "recipe_translations"("title");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_steps_recipe_id_sort_order_key" ON "recipe_steps"("recipe_id", "sort_order");

-- CreateIndex
CREATE INDEX "recipe_steps_recipe_id_idx" ON "recipe_steps"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_step_translations_step_id_language_id_key" ON "recipe_step_translations"("step_id", "language_id");

-- CreateIndex
CREATE INDEX "recipe_step_translations_language_id_idx" ON "recipe_step_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_recipe_id_sort_order_key" ON "recipe_ingredients"("recipe_id", "sort_order");

-- CreateIndex
CREATE INDEX "recipe_ingredients_product_id_idx" ON "recipe_ingredients"("product_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_measurement_unit_id_idx" ON "recipe_ingredients"("measurement_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_nutritions_recipe_id_key" ON "recipe_nutritions"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_favorites_recipe_id_user_id_key" ON "recipe_favorites"("recipe_id", "user_id");

-- CreateIndex
CREATE INDEX "recipe_favorites_user_id_idx" ON "recipe_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_likes_recipe_id_user_id_key" ON "recipe_likes"("recipe_id", "user_id");

-- CreateIndex
CREATE INDEX "recipe_likes_user_id_idx" ON "recipe_likes"("user_id");

-- CreateIndex
CREATE INDEX "shopping_lists_user_id_status_idx" ON "shopping_lists"("user_id", "status");

-- CreateIndex
CREATE INDEX "shopping_lists_source_language_id_idx" ON "shopping_lists"("source_language_id");

-- CreateIndex
CREATE INDEX "shopping_lists_created_at_idx" ON "shopping_lists"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_recipes_shopping_list_id_recipe_id_key" ON "shopping_list_recipes"("shopping_list_id", "recipe_id");

-- CreateIndex
CREATE INDEX "shopping_list_recipes_recipe_id_idx" ON "shopping_list_recipes"("recipe_id");

-- CreateIndex
CREATE INDEX "shopping_list_items_shopping_list_id_status_idx" ON "shopping_list_items"("shopping_list_id", "status");

-- CreateIndex
CREATE INDEX "shopping_list_items_product_id_idx" ON "shopping_list_items"("product_id");

-- CreateIndex
CREATE INDEX "shopping_list_items_measurement_unit_id_idx" ON "shopping_list_items"("measurement_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "background_jobs_dedup_key_key" ON "background_jobs"("dedup_key");

-- CreateIndex
CREATE INDEX "background_jobs_status_run_at_idx" ON "background_jobs"("status", "run_at");

-- CreateIndex
CREATE INDEX "background_jobs_type_status_idx" ON "background_jobs"("type", "status");

-- CreateIndex
CREATE INDEX "background_jobs_recipe_id_idx" ON "background_jobs"("recipe_id");

-- CreateIndex
CREATE INDEX "background_jobs_user_id_idx" ON "background_jobs"("user_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_source_language_id_fkey" FOREIGN KEY ("source_language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_measurement_unit_id_fkey" FOREIGN KEY ("measurement_unit_id") REFERENCES "measurement_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_source_language_id_fkey" FOREIGN KEY ("source_language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "recipe_difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_translations" ADD CONSTRAINT "recipe_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_translations" ADD CONSTRAINT "recipe_translations_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_step_translations" ADD CONSTRAINT "recipe_step_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_step_translations" ADD CONSTRAINT "recipe_step_translations_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "recipe_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_measurement_unit_id_fkey" FOREIGN KEY ("measurement_unit_id") REFERENCES "measurement_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_nutritions" ADD CONSTRAINT "recipe_nutritions_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_likes" ADD CONSTRAINT "recipe_likes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_likes" ADD CONSTRAINT "recipe_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_source_language_id_fkey" FOREIGN KEY ("source_language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_recipes" ADD CONSTRAINT "shopping_list_recipes_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_recipes" ADD CONSTRAINT "shopping_list_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_measurement_unit_id_fkey" FOREIGN KEY ("measurement_unit_id") REFERENCES "measurement_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
