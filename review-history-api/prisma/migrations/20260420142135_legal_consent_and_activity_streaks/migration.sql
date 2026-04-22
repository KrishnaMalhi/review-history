-- AlterTable
ALTER TABLE "review_streaks" ADD COLUMN     "active_days_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "active_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "community_visit_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discussion_comments_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discussion_posts_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discussion_visit_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "feed_visit_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "follows_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_active_date" TIMESTAMP(3),
ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "listings_added_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviews_added_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shares_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "validations_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "legal_version" VARCHAR(30),
ADD COLUMN     "privacy_accepted_at" TIMESTAMP(3),
ADD COLUMN     "terms_accepted_at" TIMESTAMP(3);
