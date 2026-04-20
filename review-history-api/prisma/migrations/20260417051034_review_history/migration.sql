-- CreateIndex
CREATE INDEX "entities_average_rating_idx" ON "entities"("average_rating" DESC);

-- CreateIndex
CREATE INDEX "entities_review_count_idx" ON "entities"("review_count" DESC);

-- CreateIndex
CREATE INDEX "entities_status_category_id_city_id_idx" ON "entities"("status", "category_id", "city_id");

-- CreateIndex
CREATE INDEX "entities_created_at_idx" ON "entities"("created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_status_moderation_state_idx" ON "reviews"("status", "moderation_state");

-- CreateIndex
CREATE INDEX "reviews_published_at_idx" ON "reviews"("published_at" DESC);
