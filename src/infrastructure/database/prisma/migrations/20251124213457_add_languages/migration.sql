-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('EN', 'UK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language_id" TEXT;

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "code" "LanguageCode" NOT NULL DEFAULT 'UK',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "defaultLocale" TEXT,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_translations" (
    "id" TEXT NOT NULL,
    "translation_code" "LanguageCode" NOT NULL,
    "full_label" TEXT NOT NULL,
    "short_label" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "language_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_code_idx" ON "languages"("code");

-- CreateIndex
CREATE INDEX "language_translations_translation_code_idx" ON "language_translations"("translation_code");

-- CreateIndex
CREATE UNIQUE INDEX "language_translations_language_id_translation_code_key" ON "language_translations"("language_id", "translation_code");

-- AddForeignKey
ALTER TABLE "language_translations" ADD CONSTRAINT "language_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
