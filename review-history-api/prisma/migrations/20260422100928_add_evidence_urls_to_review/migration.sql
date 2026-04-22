-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "evidence_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
