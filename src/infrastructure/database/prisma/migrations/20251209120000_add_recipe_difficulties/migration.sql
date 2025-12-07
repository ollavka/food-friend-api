-- CreateEnum
CREATE TYPE "RecipeDifficultyKey" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "recipe_difficulties" (
    "id" TEXT NOT NULL,
    "key" "RecipeDifficultyKey" NOT NULL,

    CONSTRAINT "recipe_difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_difficulty_translations" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "difficulty_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "recipe_difficulty_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_difficulties_key_key" ON "recipe_difficulties"("key");

-- CreateIndex
CREATE INDEX "recipe_difficulties_key_idx" ON "recipe_difficulties"("key");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_difficulty_translations_difficulty_id_language_id_key" ON "recipe_difficulty_translations"("difficulty_id", "language_id");

-- AddForeignKey
ALTER TABLE "recipe_difficulty_translations" ADD CONSTRAINT "recipe_difficulty_translations_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "recipe_difficulties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_difficulty_translations" ADD CONSTRAINT "recipe_difficulty_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
