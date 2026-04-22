-- CreateEnum
CREATE TYPE "review_comment_reaction_type" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "review_comments" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "dislike_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comment_reactions" (
    "id" UUID NOT NULL,
    "comment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "review_comment_reaction_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_comments_review_id_created_at_idx" ON "review_comments"("review_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "review_comments_author_user_id_idx" ON "review_comments"("author_user_id");

-- CreateIndex
CREATE INDEX "review_comment_reactions_comment_id_idx" ON "review_comment_reactions"("comment_id");

-- CreateIndex
CREATE INDEX "review_comment_reactions_user_id_idx" ON "review_comment_reactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_comment_reactions_comment_id_user_id_key" ON "review_comment_reactions"("comment_id", "user_id");

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comment_reactions" ADD CONSTRAINT "review_comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "review_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comment_reactions" ADD CONSTRAINT "review_comment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
