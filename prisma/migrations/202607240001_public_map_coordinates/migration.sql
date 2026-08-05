ALTER TABLE "properties"
ADD COLUMN "publicLatitude" DOUBLE PRECISION,
ADD COLUMN "publicLongitude" DOUBLE PRECISION,
ADD COLUMN "coordinateVerified" BOOLEAN NOT NULL DEFAULT false;

UPDATE "properties"
SET
  "publicLatitude" = "latitude",
  "publicLongitude" = "longitude"
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

CREATE INDEX "properties_publicLatitude_publicLongitude_idx"
ON "properties"("publicLatitude", "publicLongitude");
