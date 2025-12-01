-- CreateEnum
CREATE TYPE "MeasurementBaseTypeKey" AS ENUM ('MASS', 'VOLUME', 'COUNT');

-- CreateEnum
CREATE TYPE "MeasurementUnitKey" AS ENUM ('G', 'KG', 'ML', 'L', 'PC');

-- CreateTable
CREATE TABLE "measurement_base_types" (
    "id" TEXT NOT NULL,
    "key" "MeasurementBaseTypeKey" NOT NULL,

    CONSTRAINT "measurement_base_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_base_type_translations" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "base_type_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "measurement_base_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_units" (
    "id" TEXT NOT NULL,
    "key" "MeasurementUnitKey" NOT NULL,
    "ratio_to_base_convert" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "is_base_unit" BOOLEAN NOT NULL DEFAULT false,
    "is_user_selectable" BOOLEAN NOT NULL DEFAULT true,
    "base_type_id" TEXT NOT NULL,

    CONSTRAINT "measurement_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_unit_translations" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "measurement_unit_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "measurement_base_types_key_key" ON "measurement_base_types"("key");

-- CreateIndex
CREATE INDEX "measurement_base_types_key_idx" ON "measurement_base_types"("key");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_base_type_translations_base_type_id_language_id_key" ON "measurement_base_type_translations"("base_type_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_units_key_key" ON "measurement_units"("key");

-- CreateIndex
CREATE INDEX "measurement_units_key_idx" ON "measurement_units"("key");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_unit_translations_unit_id_language_id_key" ON "measurement_unit_translations"("unit_id", "language_id");

-- AddForeignKey
ALTER TABLE "measurement_base_type_translations" ADD CONSTRAINT "measurement_base_type_translations_base_type_id_fkey" FOREIGN KEY ("base_type_id") REFERENCES "measurement_base_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_base_type_translations" ADD CONSTRAINT "measurement_base_type_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_units" ADD CONSTRAINT "measurement_units_base_type_id_fkey" FOREIGN KEY ("base_type_id") REFERENCES "measurement_base_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_unit_translations" ADD CONSTRAINT "measurement_unit_translations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "measurement_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_unit_translations" ADD CONSTRAINT "measurement_unit_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
