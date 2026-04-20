-- CreateEnum
CREATE TYPE "employer_size" AS ENUM ('solo', 'micro', 'small', 'medium', 'large', 'enterprise');

-- CreateEnum
CREATE TYPE "school_type" AS ENUM ('school', 'college', 'university', 'madrasa', 'vocational');

-- CreateEnum
CREATE TYPE "curriculum_type" AS ENUM ('matric', 'cambridge', 'aga_khan', 'federal', 'other');

-- CreateEnum
CREATE TYPE "badge_type" AS ENUM ('verified_employer', 'fast_responder', 'responsive_employer', 'employee_trusted', 'verified_school', 'verified_medical', 'verified_product', 'first_review', 'five_reviews', 'ten_reviews', 'twenty_five_reviews', 'top_contributor', 'trusted_reviewer', 'streak_7', 'streak_30', 'quality_reviewer');

-- CreateEnum
CREATE TYPE "invite_status" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "issue_resolution_status" AS ENUM ('open', 'resolved_by_owner', 'confirmed_resolved', 'disputed');

-- CreateEnum
CREATE TYPE "follow_target_type" AS ENUM ('entity', 'category');

-- CreateEnum
CREATE TYPE "analytics_event_type" AS ENUM ('entity_page_view', 'review_request_sent', 'review_request_opened', 'review_request_converted', 'profile_view', 'search_impression');

-- CreateEnum
CREATE TYPE "community_validation_type" AS ENUM ('confirmed', 'outdated', 'resolved');

-- CreateEnum
CREATE TYPE "challenge_status" AS ENUM ('active', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "campaign_status" AS ENUM ('draft', 'active', 'ended');

-- CreateTable
CREATE TABLE "employer_profiles" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "cover_image_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "industry" VARCHAR(100),
    "employer_size" "employer_size",
    "founded_year" SMALLINT,
    "benefits_json" JSONB,
    "social_links_json" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_method" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_profiles" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "cover_image_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "school_type" "school_type",
    "curriculum" "curriculum_type",
    "fee_range_min" INTEGER,
    "fee_range_max" INTEGER,
    "fee_currency" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "founded_year" SMALLINT,
    "total_students" INTEGER,
    "facilities_json" JSONB,
    "branches_json" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_profiles" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "cover_image_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "specialization" VARCHAR(200),
    "qualifications" VARCHAR(500),
    "experience_years" SMALLINT,
    "hospital_affiliation" VARCHAR(200),
    "consultation_fee" INTEGER,
    "fee_currency" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "timings_json" JSONB,
    "services_json" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "pmdc_number" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_profiles" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "description" TEXT,
    "brand" VARCHAR(200),
    "image_url" VARCHAR(500),
    "variants_json" JSONB,
    "nutrition_json" JSONB,
    "product_category" VARCHAR(100),
    "barcode" VARCHAR(50),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_response_metrics" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "replied_reviews" INTEGER NOT NULL DEFAULT 0,
    "response_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "avg_response_time_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "issues_resolved_count" INTEGER NOT NULL DEFAULT 0,
    "last_replied_at" TIMESTAMP(3),
    "recalculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_response_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL,
    "badge_type" "badge_type" NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" UUID NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace_review_data" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "work_culture" SMALLINT,
    "salary_fairness" SMALLINT,
    "management_quality" SMALLINT,
    "career_growth" SMALLINT,
    "work_life_balance" SMALLINT,
    "benefits_satisfaction" SMALLINT,
    "recommend_score" SMALLINT,
    "employment_status" VARCHAR(30),
    "job_title" VARCHAR(100),
    "department_name" VARCHAR(100),
    "years_at_company" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workplace_review_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_review_data" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "teaching_quality" SMALLINT,
    "discipline" SMALLINT,
    "environment" SMALLINT,
    "administration" SMALLINT,
    "extracurriculars" SMALLINT,
    "safety" SMALLINT,
    "reviewer_type" VARCHAR(20),
    "grade_or_class" VARCHAR(30),
    "branch_name" VARCHAR(100),
    "years_attended" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_review_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_review_data" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "treatment_effectiveness" SMALLINT,
    "diagnosis_accuracy" SMALLINT,
    "doctor_behavior" SMALLINT,
    "wait_time" SMALLINT,
    "staff_behavior" SMALLINT,
    "cleanliness" SMALLINT,
    "cost_fairness" SMALLINT,
    "condition_treated" VARCHAR(200),
    "visit_type" VARCHAR(30),
    "would_recommend" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_review_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_review_data" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "taste" SMALLINT,
    "quality" SMALLINT,
    "value_for_money" SMALLINT,
    "packaging" SMALLINT,
    "consistency" SMALLINT,
    "variant" VARCHAR(100),
    "image_url" VARCHAR(500),
    "purchase_place" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_review_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_submissions" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "job_title" VARCHAR(100) NOT NULL,
    "department_name" VARCHAR(100),
    "salary_min" INTEGER NOT NULL,
    "salary_max" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "employment_type" VARCHAR(30) NOT NULL,
    "experience_years" SMALLINT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_invites" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "label" VARCHAR(100),
    "status" "invite_status" NOT NULL DEFAULT 'active',
    "max_uses" INTEGER,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_resolutions" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "reply_id" UUID NOT NULL,
    "status" "issue_resolution_status" NOT NULL DEFAULT 'open',
    "resolved_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" "follow_target_type" NOT NULL,
    "target_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "event_type" "analytics_event_type" NOT NULL,
    "entity_id" UUID,
    "user_id" UUID,
    "invite_id" UUID,
    "metadata_json" JSONB,
    "ip_hash" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_validations" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "validation_type" "community_validation_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_quality_scores" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "length_score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "detail_score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "balance_score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "helpful_ratio" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "recalculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_quality_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_streaks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_review_date" TIMESTAMP(3),
    "weekly_count" INTEGER NOT NULL DEFAULT 0,
    "week_start_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category_key" VARCHAR(50),
    "target_goal" INTEGER NOT NULL,
    "status" "campaign_status" NOT NULL DEFAULT 'draft',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_participants" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "selected_city_id" UUID,
    "category_keys_json" JSONB,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_templates" (
    "id" UUID NOT NULL,
    "category_key" VARCHAR(50),
    "sentiment" VARCHAR(20) NOT NULL,
    "title_en" VARCHAR(200) NOT NULL,
    "title_ur" VARCHAR(400),
    "body_en" TEXT NOT NULL,
    "body_ur" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employer_profiles_entity_id_key" ON "employer_profiles"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_profiles_entity_id_key" ON "school_profiles"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_profiles_entity_id_key" ON "medical_profiles"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_profiles_entity_id_key" ON "product_profiles"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "entity_response_metrics_entity_id_key" ON "entity_response_metrics"("entity_id");

-- CreateIndex
CREATE INDEX "entity_response_metrics_response_rate_idx" ON "entity_response_metrics"("response_rate" DESC);

-- CreateIndex
CREATE INDEX "badges_target_type_target_id_idx" ON "badges"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_badge_type_target_type_target_id_key" ON "badges"("badge_type", "target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "workplace_review_data_review_id_key" ON "workplace_review_data"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_review_data_review_id_key" ON "school_review_data"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_review_data_review_id_key" ON "medical_review_data"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_review_data_review_id_key" ON "product_review_data"("review_id");

-- CreateIndex
CREATE INDEX "salary_submissions_entity_id_job_title_idx" ON "salary_submissions"("entity_id", "job_title");

-- CreateIndex
CREATE INDEX "salary_submissions_entity_id_status_idx" ON "salary_submissions"("entity_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "salary_submissions_author_user_id_entity_id_job_title_key" ON "salary_submissions"("author_user_id", "entity_id", "job_title");

-- CreateIndex
CREATE UNIQUE INDEX "review_invites_token_key" ON "review_invites"("token");

-- CreateIndex
CREATE INDEX "review_invites_token_idx" ON "review_invites"("token");

-- CreateIndex
CREATE INDEX "review_invites_entity_id_idx" ON "review_invites"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_resolutions_review_id_key" ON "issue_resolutions"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_resolutions_reply_id_key" ON "issue_resolutions"("reply_id");

-- CreateIndex
CREATE INDEX "follows_target_type_target_id_idx" ON "follows"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "follows_user_id_idx" ON "follows"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_user_id_target_type_target_id_key" ON "follows"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_entity_id_idx" ON "analytics_events"("event_type", "entity_id");

-- CreateIndex
CREATE INDEX "analytics_events_entity_id_created_at_idx" ON "analytics_events"("entity_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "analytics_events_invite_id_idx" ON "analytics_events"("invite_id");

-- CreateIndex
CREATE INDEX "community_validations_review_id_idx" ON "community_validations"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_validations_review_id_user_id_validation_type_key" ON "community_validations"("review_id", "user_id", "validation_type");

-- CreateIndex
CREATE UNIQUE INDEX "review_quality_scores_review_id_key" ON "review_quality_scores"("review_id");

-- CreateIndex
CREATE INDEX "review_quality_scores_total_score_idx" ON "review_quality_scores"("total_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "review_streaks_user_id_key" ON "review_streaks"("user_id");

-- CreateIndex
CREATE INDEX "campaigns_status_starts_at_idx" ON "campaigns"("status", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_participants_campaign_id_user_id_key" ON "campaign_participants"("campaign_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_preferences_user_id_key" ON "onboarding_preferences"("user_id");

-- CreateIndex
CREATE INDEX "response_templates_category_key_sentiment_is_active_idx" ON "response_templates"("category_key", "sentiment", "is_active");

-- AddForeignKey
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_profiles" ADD CONSTRAINT "school_profiles_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_profiles" ADD CONSTRAINT "medical_profiles_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_profiles" ADD CONSTRAINT "product_profiles_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_response_metrics" ADD CONSTRAINT "entity_response_metrics_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workplace_review_data" ADD CONSTRAINT "workplace_review_data_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_review_data" ADD CONSTRAINT "school_review_data_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_review_data" ADD CONSTRAINT "medical_review_data_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_review_data" ADD CONSTRAINT "product_review_data_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_submissions" ADD CONSTRAINT "salary_submissions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_submissions" ADD CONSTRAINT "salary_submissions_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_invites" ADD CONSTRAINT "review_invites_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_invites" ADD CONSTRAINT "review_invites_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_resolutions" ADD CONSTRAINT "issue_resolutions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_resolutions" ADD CONSTRAINT "issue_resolutions_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "review_replies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_validations" ADD CONSTRAINT "community_validations_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_validations" ADD CONSTRAINT "community_validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_quality_scores" ADD CONSTRAINT "review_quality_scores_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_streaks" ADD CONSTRAINT "review_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_preferences" ADD CONSTRAINT "onboarding_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
