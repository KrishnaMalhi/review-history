DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blog_post_status') THEN
    CREATE TYPE "blog_post_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "blog_categories" (
  "id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_name_key" ON "blog_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_key" ON "blog_categories"("slug");
CREATE INDEX IF NOT EXISTS "blog_categories_slug_idx" ON "blog_categories"("slug");

CREATE TABLE IF NOT EXISTS "blog_tags" (
  "id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_name_key" ON "blog_tags"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_slug_key" ON "blog_tags"("slug");
CREATE INDEX IF NOT EXISTS "blog_tags_slug_idx" ON "blog_tags"("slug");

ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "category_id" UUID,
  ADD COLUMN IF NOT EXISTS "featured_image" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "status" "blog_post_status" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "read_time" INTEGER,
  ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "meta_title" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "meta_description" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_title" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "seo_description" TEXT,
  ADD COLUMN IF NOT EXISTS "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "og_image_url" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "canonical_url" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "author_name" VARCHAR(150);

CREATE INDEX IF NOT EXISTS "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at" DESC);
CREATE INDEX IF NOT EXISTS "blog_posts_category_id_idx" ON "blog_posts"("category_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_category_id_fkey'
      AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE "blog_posts"
      ADD CONSTRAINT "blog_posts_category_id_fkey"
      FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "_BlogPostToBlogTag" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_BlogPostToBlogTag_AB_unique" ON "_BlogPostToBlogTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogPostToBlogTag_B_index" ON "_BlogPostToBlogTag"("B");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = '_BlogPostToBlogTag_A_fkey'
      AND table_name = '_BlogPostToBlogTag'
  ) THEN
    ALTER TABLE "_BlogPostToBlogTag"
      ADD CONSTRAINT "_BlogPostToBlogTag_A_fkey"
      FOREIGN KEY ("A") REFERENCES "blog_posts"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = '_BlogPostToBlogTag_B_fkey'
      AND table_name = '_BlogPostToBlogTag'
  ) THEN
    ALTER TABLE "_BlogPostToBlogTag"
      ADD CONSTRAINT "_BlogPostToBlogTag_B_fkey"
      FOREIGN KEY ("B") REFERENCES "blog_tags"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

