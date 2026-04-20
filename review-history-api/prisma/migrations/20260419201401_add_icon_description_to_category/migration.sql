-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "description" VARCHAR(300) NOT NULL DEFAULT '',
ADD COLUMN     "icon" VARCHAR(50) NOT NULL DEFAULT 'Tag';
