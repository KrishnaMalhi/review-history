ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_body_max_length_chk"
CHECK (char_length("body") <= 5000);

ALTER TABLE "review_replies"
ADD CONSTRAINT "review_replies_body_max_length_chk"
CHECK (char_length("body") <= 2000);

ALTER TABLE "review_reports"
ADD CONSTRAINT "review_reports_reason_text_max_length_chk"
CHECK ("reason_text" IS NULL OR char_length("reason_text") <= 1000);

ALTER TABLE "moderation_actions"
ADD CONSTRAINT "moderation_actions_notes_max_length_chk"
CHECK ("notes" IS NULL OR char_length("notes") <= 1000);

ALTER TABLE "entity_claims"
ADD CONSTRAINT "entity_claims_admin_notes_max_length_chk"
CHECK ("admin_notes" IS NULL OR char_length("admin_notes") <= 500);
