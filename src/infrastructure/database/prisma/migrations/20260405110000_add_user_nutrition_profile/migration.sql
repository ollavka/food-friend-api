-- CreateEnum
CREATE TYPE "NutritionSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "NutritionActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "NutritionGoal" AS ENUM ('LOSE_WEIGHT', 'MAINTAIN_WEIGHT', 'GAIN_WEIGHT');

-- CreateTable
CREATE TABLE "user_nutrition_profiles" (
  "id" TEXT NOT NULL,
  "sex" "NutritionSex" NOT NULL,
  "age" INTEGER NOT NULL,
  "height_cm" INTEGER NOT NULL,
  "weight_kg" DECIMAL(65,30) NOT NULL,
  "activity_level" "NutritionActivityLevel" NOT NULL,
  "goal" "NutritionGoal" NOT NULL,
  "target_calories" INTEGER,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_nutrition_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_nutrition_profiles_user_id_key" ON "user_nutrition_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_nutrition_profiles_goal_idx" ON "user_nutrition_profiles"("goal");

-- CreateIndex
CREATE INDEX "user_nutrition_profiles_activity_level_idx" ON "user_nutrition_profiles"("activity_level");

-- AddForeignKey
ALTER TABLE "user_nutrition_profiles" ADD CONSTRAINT "user_nutrition_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
