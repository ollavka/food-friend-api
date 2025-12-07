-- DropForeignKey
ALTER TABLE "language_translations" DROP CONSTRAINT "language_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "measurement_base_type_translations" DROP CONSTRAINT "measurement_base_type_translations_base_type_id_fkey";

-- DropForeignKey
ALTER TABLE "measurement_unit_translations" DROP CONSTRAINT "measurement_unit_translations_unit_id_fkey";

-- AddForeignKey
ALTER TABLE "language_translations" ADD CONSTRAINT "language_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_base_type_translations" ADD CONSTRAINT "measurement_base_type_translations_base_type_id_fkey" FOREIGN KEY ("base_type_id") REFERENCES "measurement_base_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_unit_translations" ADD CONSTRAINT "measurement_unit_translations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "measurement_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
