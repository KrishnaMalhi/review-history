-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "UserTrustLevel" AS ENUM ('new_user', 'established', 'trusted');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('draft', 'active', 'claimed', 'under_review', 'merged', 'suspended', 'archived');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('draft', 'submitted', 'published', 'under_verification', 'hidden', 'removed', 'archived');

-- CreateEnum
CREATE TYPE "ModerationState" AS ENUM ('clean', 'low_confidence', 'under_verification', 'hidden_pending_review', 'removed_by_policy');

-- CreateEnum
CREATE TYPE "RiskState" AS ENUM ('clean', 'low_confidence', 'under_verification', 'hidden_pending_review');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('helpful', 'not_helpful', 'seems_fake');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('personal_information', 'fake_review', 'wrong_entity', 'threatening_content', 'spam', 'harassment', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'triaged', 'resolved', 'appealed', 'closed');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('owner', 'representative', 'manager');

-- CreateEnum
CREATE TYPE "ClaimVerificationMethod" AS ENUM ('phone_otp', 'document', 'business_email');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected', 'revoked');

-- CreateEnum
CREATE TYPE "ModerationCaseSeverity" AS ENUM ('low', 'medium', 'high', 'legal_sensitive');

-- CreateEnum
CREATE TYPE "ModerationCaseStatus" AS ENUM ('open', 'in_progress', 'resolved', 'appealed', 'closed');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('keep', 'label', 'redact', 'hide_review', 'remove_review', 'suspend_user', 'ban_user', 'merge_entity', 'close_case', 'escalate');

-- CreateEnum
CREATE TYPE "DuplicateCandidateStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'merged');

-- CreateEnum
CREATE TYPE "DuplicateVote" AS ENUM ('same_entity', 'different_entity');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('in_app', 'sms', 'email');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('review_submitted', 'review_flagged', 'review_removed', 'claim_approved', 'claim_rejected', 'reply_received', 'entity_merged', 'moderation_action', 'trust_score_changed');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('user', 'admin', 'system');

-- CreateEnum
CREATE TYPE "ReplyStatus" AS ENUM ('published', 'hidden', 'removed');

-- CreateEnum
CREATE TYPE "ReplyAuthorRole" AS ENUM ('claimed_owner', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "BillingPlanStatus" AS ENUM ('active', 'cancelled', 'expired', 'past_due');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "AliasType" AS ENUM ('alternate_name', 'former_name', 'merged_from', 'common_misspelling');

-- CreateEnum
CREATE TYPE "AliasSource" AS ENUM ('user_submitted', 'system_generated', 'admin_created', 'merge_result');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone_e164" VARCHAR(20) NOT NULL,
    "phone_country_code" VARCHAR(5) NOT NULL DEFAULT '+92',
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "display_name" VARCHAR(100),
    "username_slug" VARCHAR(100),
    "city_id" UUID,
    "trust_level" "UserTrustLevel" NOT NULL DEFAULT 'new_user',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_fingerprint_hash" VARCHAR(64) NOT NULL,
    "first_ip_hash" VARCHAR(64) NOT NULL,
    "last_ip_hash" VARCHAR(64) NOT NULL,
    "user_agent_hash" VARCHAR(64) NOT NULL,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "risk_score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(64) NOT NULL,
    "device_id" UUID,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_ur" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warning_tags" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "label_en" VARCHAR(100) NOT NULL,
    "label_ur" VARCHAR(200) NOT NULL,
    "severity_weight" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_positive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "warning_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_ur" VARCHAR(200) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localities" (
    "id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_ur" VARCHAR(200) NOT NULL,
    "postal_code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "localities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entities" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "normalized_name" VARCHAR(200) NOT NULL,
    "phone_e164" VARCHAR(20),
    "alternate_phones_json" JSONB,
    "address_line" VARCHAR(300),
    "landmark" VARCHAR(200),
    "city_id" UUID NOT NULL,
    "locality_id" UUID,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "entity_fingerprint" VARCHAR(64) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_user_id" UUID,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "trust_score" INTEGER NOT NULL DEFAULT 0,
    "suspicious_review_count" INTEGER NOT NULL DEFAULT 0,
    "hidden_review_count" INTEGER NOT NULL DEFAULT 0,
    "last_reviewed_at" TIMESTAMP(3),
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_aliases" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "alias_text" VARCHAR(200) NOT NULL,
    "alias_type" "AliasType" NOT NULL,
    "source" "AliasSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_claims" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "requester_user_id" UUID NOT NULL,
    "claim_type" "ClaimType" NOT NULL,
    "verification_method" "ClaimVerificationMethod" NOT NULL,
    "submitted_phone" VARCHAR(20),
    "submitted_documents_json" JSONB,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "overall_rating" SMALLINT NOT NULL,
    "title" VARCHAR(200),
    "body" TEXT NOT NULL,
    "visit_context" VARCHAR(100),
    "experience_month" SMALLINT,
    "experience_year" SMALLINT,
    "language_code" VARCHAR(5) NOT NULL DEFAULT 'en',
    "status" "ReviewStatus" NOT NULL DEFAULT 'submitted',
    "moderation_state" "ModerationState" NOT NULL DEFAULT 'clean',
    "risk_state" "RiskState" NOT NULL DEFAULT 'clean',
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "fake_vote_count" INTEGER NOT NULL DEFAULT 0,
    "under_verification" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_tag_links" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "intensity" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_tag_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_votes" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "voter_user_id" UUID NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_reports" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "reporter_user_id" UUID,
    "report_type" "ReportType" NOT NULL,
    "reason_text" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolver_user_id" UUID,

    CONSTRAINT "review_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "author_role" "ReplyAuthorRole" NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ReplyStatus" NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_cases" (
    "id" UUID NOT NULL,
    "object_type" VARCHAR(50) NOT NULL,
    "object_id" UUID NOT NULL,
    "trigger_type" VARCHAR(50) NOT NULL,
    "severity" "ModerationCaseSeverity" NOT NULL,
    "status" "ModerationCaseStatus" NOT NULL DEFAULT 'open',
    "assigned_admin_id" UUID,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "action_type" "ModerationActionType" NOT NULL,
    "performed_by" UUID NOT NULL,
    "notes" TEXT,
    "previous_state_json" JSONB,
    "new_state_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicate_candidates" (
    "id" UUID NOT NULL,
    "entity_a_id" UUID NOT NULL,
    "entity_b_id" UUID NOT NULL,
    "similarity_score" DECIMAL(5,2) NOT NULL,
    "reason_codes_json" JSONB NOT NULL,
    "status" "DuplicateCandidateStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "duplicate_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicate_merge_votes" (
    "id" UUID NOT NULL,
    "duplicate_candidate_id" UUID NOT NULL,
    "voter_user_id" UUID NOT NULL,
    "vote" "DuplicateVote" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duplicate_merge_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_score_events" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "source_object_type" VARCHAR(50) NOT NULL,
    "source_object_id" UUID NOT NULL,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_score_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_type" "AuditActorType" NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "object_type" VARCHAR(50) NOT NULL,
    "object_id" UUID NOT NULL,
    "metadata_json" JSONB,
    "ip_hash" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'in_app',
    "type" "NotificationType" NOT NULL,
    "payload_json" JSONB NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_customers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_key" VARCHAR(50) NOT NULL,
    "status" "BillingPlanStatus" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "billing_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoices" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "amount_pkr" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'PKR',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "external_ref" VARCHAR(200),
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_e164_key" ON "users"("phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_slug_key" ON "users"("username_slug");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "user_devices_user_id_idx" ON "user_devices"("user_id");

-- CreateIndex
CREATE INDEX "user_devices_device_fingerprint_hash_idx" ON "user_devices"("device_fingerprint_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_hash_idx" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "categories_key_key" ON "categories"("key");

-- CreateIndex
CREATE INDEX "categories_is_active_sort_order_idx" ON "categories"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "warning_tags_key_key" ON "warning_tags"("key");

-- CreateIndex
CREATE INDEX "warning_tags_category_id_is_active_idx" ON "warning_tags"("category_id", "is_active");

-- CreateIndex
CREATE INDEX "cities_is_active_idx" ON "cities"("is_active");

-- CreateIndex
CREATE INDEX "localities_city_id_is_active_idx" ON "localities"("city_id", "is_active");

-- CreateIndex
CREATE INDEX "entities_normalized_name_idx" ON "entities"("normalized_name");

-- CreateIndex
CREATE INDEX "entities_entity_fingerprint_idx" ON "entities"("entity_fingerprint");

-- CreateIndex
CREATE INDEX "entities_city_id_locality_id_category_id_idx" ON "entities"("city_id", "locality_id", "category_id");

-- CreateIndex
CREATE INDEX "entities_status_idx" ON "entities"("status");

-- CreateIndex
CREATE INDEX "entities_trust_score_idx" ON "entities"("trust_score" DESC);

-- CreateIndex
CREATE INDEX "entity_aliases_entity_id_idx" ON "entity_aliases"("entity_id");

-- CreateIndex
CREATE INDEX "entity_aliases_alias_text_idx" ON "entity_aliases"("alias_text");

-- CreateIndex
CREATE INDEX "entity_claims_entity_id_idx" ON "entity_claims"("entity_id");

-- CreateIndex
CREATE INDEX "entity_claims_requester_user_id_idx" ON "entity_claims"("requester_user_id");

-- CreateIndex
CREATE INDEX "entity_claims_status_idx" ON "entity_claims"("status");

-- CreateIndex
CREATE INDEX "reviews_entity_id_status_created_at_idx" ON "reviews"("entity_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_author_user_id_idx" ON "reviews"("author_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_author_user_id_entity_id_key" ON "reviews"("author_user_id", "entity_id");

-- CreateIndex
CREATE INDEX "review_tag_links_review_id_idx" ON "review_tag_links"("review_id");

-- CreateIndex
CREATE INDEX "review_tag_links_tag_id_idx" ON "review_tag_links"("tag_id");

-- CreateIndex
CREATE INDEX "review_votes_review_id_idx" ON "review_votes"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_votes_review_id_voter_user_id_vote_type_key" ON "review_votes"("review_id", "voter_user_id", "vote_type");

-- CreateIndex
CREATE INDEX "review_reports_review_id_idx" ON "review_reports"("review_id");

-- CreateIndex
CREATE INDEX "review_reports_status_idx" ON "review_reports"("status");

-- CreateIndex
CREATE INDEX "review_replies_review_id_idx" ON "review_replies"("review_id");

-- CreateIndex
CREATE INDEX "moderation_cases_status_severity_idx" ON "moderation_cases"("status", "severity");

-- CreateIndex
CREATE INDEX "moderation_cases_object_type_object_id_idx" ON "moderation_cases"("object_type", "object_id");

-- CreateIndex
CREATE INDEX "moderation_actions_case_id_idx" ON "moderation_actions"("case_id");

-- CreateIndex
CREATE INDEX "duplicate_candidates_status_similarity_score_idx" ON "duplicate_candidates"("status", "similarity_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "duplicate_merge_votes_duplicate_candidate_id_voter_user_id_key" ON "duplicate_merge_votes"("duplicate_candidate_id", "voter_user_id");

-- CreateIndex
CREATE INDEX "trust_score_events_entity_id_effective_at_idx" ON "trust_score_events"("entity_id", "effective_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_object_type_object_id_idx" ON "audit_logs"("object_type", "object_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "billing_customers_user_id_idx" ON "billing_customers"("user_id");

-- CreateIndex
CREATE INDEX "billing_invoices_customer_id_idx" ON "billing_invoices"("customer_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "user_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warning_tags" ADD CONSTRAINT "warning_tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localities" ADD CONSTRAINT "localities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_claimed_user_id_fkey" FOREIGN KEY ("claimed_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_aliases" ADD CONSTRAINT "entity_aliases_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_claims" ADD CONSTRAINT "entity_claims_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_claims" ADD CONSTRAINT "entity_claims_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_claims" ADD CONSTRAINT "entity_claims_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tag_links" ADD CONSTRAINT "review_tag_links_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tag_links" ADD CONSTRAINT "review_tag_links_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "warning_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_voter_user_id_fkey" FOREIGN KEY ("voter_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "moderation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_entity_a_id_fkey" FOREIGN KEY ("entity_a_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_entity_b_id_fkey" FOREIGN KEY ("entity_b_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicate_merge_votes" ADD CONSTRAINT "duplicate_merge_votes_duplicate_candidate_id_fkey" FOREIGN KEY ("duplicate_candidate_id") REFERENCES "duplicate_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicate_merge_votes" ADD CONSTRAINT "duplicate_merge_votes_voter_user_id_fkey" FOREIGN KEY ("voter_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_score_events" ADD CONSTRAINT "trust_score_events_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_customers" ADD CONSTRAINT "billing_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "billing_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
