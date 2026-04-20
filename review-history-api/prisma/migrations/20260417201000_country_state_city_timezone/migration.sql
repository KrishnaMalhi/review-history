-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "iso_code" VARCHAR(10) NOT NULL,
    "flag" VARCHAR(20),
    "phone_code" VARCHAR(30),
    "currency" VARCHAR(20),
    "flag_image" VARCHAR(500),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "iso_code" VARCHAR(30) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timezones" (
    "id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "zone_name" VARCHAR(120) NOT NULL,
    "gmt_offset" INTEGER NOT NULL,
    "gmt_offset_name" VARCHAR(20) NOT NULL,
    "abbreviation" VARCHAR(20),
    "tz_name" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timezones_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "cities"
    ADD COLUMN "country_id" UUID,
    ADD COLUMN "state_id" UUID,
    ADD COLUMN "timezone_id" UUID,
    ADD COLUMN "external_key" VARCHAR(255),
    ADD COLUMN "latitude" DECIMAL(10,7),
    ADD COLUMN "longitude" DECIMAL(10,7),
    ALTER COLUMN "name_ur" DROP NOT NULL,
    ALTER COLUMN "province" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_key" ON "countries"("iso_code");

-- CreateIndex
CREATE INDEX "countries_is_active_idx" ON "countries"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "states_country_id_iso_code_key" ON "states"("country_id", "iso_code");

-- CreateIndex
CREATE INDEX "states_country_id_is_active_idx" ON "states"("country_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "timezones_country_id_zone_name_key" ON "timezones"("country_id", "zone_name");

-- CreateIndex
CREATE INDEX "timezones_country_id_idx" ON "timezones"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_external_key_key" ON "cities"("external_key");

-- CreateIndex
CREATE INDEX "cities_country_id_state_id_name_en_idx" ON "cities"("country_id", "state_id", "name_en");

-- CreateIndex
CREATE INDEX "cities_timezone_id_idx" ON "cities"("timezone_id");

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_fkey"
    FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timezones" ADD CONSTRAINT "timezones_country_id_fkey"
    FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey"
    FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey"
    FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_timezone_id_fkey"
    FOREIGN KEY ("timezone_id") REFERENCES "timezones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
