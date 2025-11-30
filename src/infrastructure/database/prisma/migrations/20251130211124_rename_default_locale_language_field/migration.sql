/*
  Warnings:

  - You are about to drop the column `defaultLocale` on the `languages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "languages" DROP COLUMN "defaultLocale",
ADD COLUMN     "default_locale" TEXT;
