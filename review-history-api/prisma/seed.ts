import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { seedCountryData } from './seed-country-data';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'kirshna.malhi066@gmail.com';
const ADMIN_PHONE_E164 = '+923363598202';
const ADMIN_PHONE_LOCAL = '03363598202';

const CATEGORY_SEED = [
  { key: 'landlord', nameEn: 'Landlords', nameUr: 'مالکان' },
  { key: 'real_estate_agent', nameEn: 'Real Estate Agents', nameUr: 'ریئل اسٹیٹ ایجنٹس' },
  { key: 'doctor', nameEn: 'Doctors & Clinics', nameUr: 'ڈاکٹرز اور کلینکس' },
  { key: 'mechanic', nameEn: 'Mechanics', nameUr: 'مکینکس' },
  { key: 'tutor', nameEn: 'Schools & Tutors', nameUr: 'اسکولز اور ٹیوٹرز' },
  { key: 'contractor', nameEn: 'Contractors', nameUr: 'ٹھیکیدار' },
  { key: 'employer', nameEn: 'Employers', nameUr: 'ایمپلائرز' },
  { key: 'local_business', nameEn: 'Local Businesses', nameUr: 'لوکل بزنسز' },
  { key: 'service_provider', nameEn: 'Service Providers', nameUr: 'سروس پرووائیڈرز' },
  { key: 'agency', nameEn: 'Agencies', nameUr: 'ایجنسیاں' },
] as const;

const COMPANY_PREFIX = ['Apex', 'Prime', 'Trusted', 'Urban', 'National', 'Royal', 'Pioneer', 'Modern'];
const COMPANY_SUFFIX = ['Solutions', 'Enterprises', 'Group', 'Associates', 'Systems', 'Works', 'Services', 'Traders'];
const REVIEW_SNIPPETS = [
  'The experience was smooth overall and communication was clear.',
  'Service quality was acceptable but there is room for improvement.',
  'Timelines were mostly respected and support was responsive.',
  'Pricing was fair for the market and expectations were met.',
  'Team behavior was professional and the process felt transparent.',
];

type SeedConfig = {
  resetExisting: boolean;
  batchSize: number;
  users: number;
  entities: number;
  reviewsPerCategory: number;
  reviewVotes: number;
  reviewComments: number;
  reviewReplies: number;
  reviewCommentReactions: number;
  claims: number;
  follows: number;
  discussions: number;
  discussionComments: number;
  discussionReactions: number;
  blogCategories: number;
  blogTags: number;
  blogs: number;
  campaigns: number;
  campaignParticipants: number;
  responseTemplates: number;
  includeProfilesForEveryEntity: boolean;
};

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw.toLowerCase() === 'true';
}

function loadConfig(): SeedConfig {
  return {
    resetExisting: boolEnv('SEED_RESET_EXISTING', true),
    batchSize: intEnv('SEED_BATCH_SIZE', 5000),
    users: intEnv('SEED_USERS', 1_000_000),
    entities: intEnv('SEED_ENTITIES', 1_000_000),
    reviewsPerCategory: intEnv('SEED_REVIEWS_PER_CATEGORY', 1_000_000),
    reviewVotes: intEnv('SEED_REVIEW_VOTES', 1_000_000),
    reviewComments: intEnv('SEED_REVIEW_COMMENTS', 1_000_000),
    reviewReplies: intEnv('SEED_REVIEW_REPLIES', 1_000_000),
    reviewCommentReactions: intEnv('SEED_REVIEW_COMMENT_REACTIONS', 1_000_000),
    claims: intEnv('SEED_CLAIMS', 1_000_000),
    follows: intEnv('SEED_FOLLOWS', 1_000_000),
    discussions: intEnv('SEED_DISCUSSIONS', 1_000_000),
    discussionComments: intEnv('SEED_DISCUSSION_COMMENTS', 1_000_000),
    discussionReactions: intEnv('SEED_DISCUSSION_REACTIONS', 1_000_000),
    blogCategories: intEnv('SEED_BLOG_CATEGORIES', 1_000_000),
    blogTags: intEnv('SEED_BLOG_TAGS', 1_000_000),
    blogs: intEnv('SEED_BLOG_POSTS', 1_000_000),
    campaigns: intEnv('SEED_CAMPAIGNS', 1_000_000),
    campaignParticipants: intEnv('SEED_CAMPAIGN_PARTICIPANTS', 1_000_000),
    responseTemplates: intEnv('SEED_RESPONSE_TEMPLATES', 1_000_000),
    includeProfilesForEveryEntity: boolEnv('SEED_ALL_ENTITY_PROFILES', true),
  };
}

function makeDeterministicUuid(namespace: string, index: number): string {
  const hex = createHash('sha1').update(`${namespace}:${index}`).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);
}

function hash64(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function phoneForUser(index: number): string {
  return `+92300${index.toString().padStart(7, '0')}`;
}

function emailForUser(index: number): string {
  return `user${index.toString().padStart(7, '0')}@yopmail.com`;
}

function userIdAt(index: number): string {
  return makeDeterministicUuid('seed-user', index);
}

function entityIdAt(index: number): string {
  return makeDeterministicUuid('seed-entity', index);
}

function reviewId(categoryIdx: number, reviewIdx: number): string {
  return makeDeterministicUuid(`seed-review-${categoryIdx}`, reviewIdx);
}

function reviewByGlobalIndex(globalReviewIndex: number, reviewsPerCategory: number): { categoryIdx: number; reviewIdx: number } {
  const categoryIdx = Math.floor((globalReviewIndex - 1) / reviewsPerCategory);
  const reviewIdx = ((globalReviewIndex - 1) % reviewsPerCategory) + 1;
  return { categoryIdx, reviewIdx };
}

function totalReviewCount(categoryCount: number, reviewsPerCategory: number): number {
  return categoryCount * reviewsPerCategory;
}

function entityIndexForCategory(categoryIdx: number, ordinal: number, entityCount: number, categoryCount: number): number {
  const maxOrdinal = Math.floor((entityCount - (categoryIdx + 1)) / categoryCount);
  const safeOrdinal = maxOrdinal <= 0 ? 0 : ordinal % (maxOrdinal + 1);
  return categoryIdx + 1 + safeOrdinal * categoryCount;
}

async function cleanupExistingData(): Promise<void> {
  const candidateTables = [
    '_BlogPostToBlogTag',
    'discussion_reactions',
    'discussion_comments',
    'discussion_posts',
    'campaign_participants',
    'campaigns',
    'onboarding_preferences',
    'response_templates',
    'review_comment_reactions',
    'review_comments',
    'review_replies',
    'review_reports',
    'review_votes',
    'review_tag_links',
    'workplace_review_data',
    'school_review_data',
    'medical_review_data',
    'product_review_data',
    'issue_resolutions',
    'community_validations',
    'review_quality_scores',
    'salary_submissions',
    'review_invites',
    'review_streaks',
    'trust_score_events',
    'audit_logs',
    'notifications',
    'follows',
    'entity_claims',
    'entity_aliases',
    'employer_profiles',
    'school_profiles',
    'medical_profiles',
    'product_profiles',
    'entity_response_metrics',
    'reviews',
    'blog_posts',
    'blog_tags',
    'blog_categories',
    'badges',
    'duplicate_merge_votes',
    'duplicate_candidates',
    'moderation_actions',
    'moderation_cases',
    'billing_invoices',
    'billing_customers',
    'sessions',
    'user_devices',
    'entities',
    'warning_tags',
    'categories',
    'users',
  ];

  const quoted = candidateTables.map((table) => `'${table}'`).join(',');
  const existing = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (${quoted})`,
  );
  if (!existing.length) return;

  const toTruncate = existing.map((row) => `"${row.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${toTruncate} RESTART IDENTITY CASCADE`);
  console.log(`✅ Existing seeded tables truncated (${existing.length} tables)`);
}

async function ensureCategories(): Promise<Array<{ id: string; key: string }>> {
  const out: Array<{ id: string; key: string }> = [];
  for (let i = 0; i < CATEGORY_SEED.length; i += 1) {
    const row = CATEGORY_SEED[i];
    const category = await prisma.category.upsert({
      where: { key: row.key },
      update: {
        nameEn: row.nameEn,
        nameUr: row.nameUr,
        icon: 'Tag',
        description: `${row.nameEn} synthetic category`,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        id: makeDeterministicUuid('seed-category', i + 1),
        key: row.key,
        nameEn: row.nameEn,
        nameUr: row.nameUr,
        icon: 'Tag',
        description: `${row.nameEn} synthetic category`,
        sortOrder: i + 1,
        isActive: true,
      },
      select: { id: true, key: true },
    });
    out.push(category);
  }
  return out;
}

async function ensureAdmin() {
  const adminPasswordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Krishna!@12!@', 12);
  const admin = await prisma.user.upsert({
    where: { phoneE164: ADMIN_PHONE_E164 },
    update: {
      email: ADMIN_EMAIL,
      displayName: 'Krishna Malhi',
      role: 'admin',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true,
      phoneCountryCode: '+92',
      termsAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
      privacyAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
      legalVersion: '2026-04-22',
      passwordHash: adminPasswordHash,
    },
    create: {
      id: makeDeterministicUuid('seed-admin', 1),
      email: ADMIN_EMAIL,
      phoneE164: ADMIN_PHONE_E164,
      displayName: 'Krishna Malhi',
      role: 'admin',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true,
      phoneCountryCode: '+92',
      termsAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
      privacyAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
      legalVersion: '2026-04-22',
      passwordHash: adminPasswordHash,
    },
    select: { id: true, email: true, phoneE164: true },
  });
  console.log(`✅ Admin ready: ${admin.email} / ${ADMIN_PHONE_LOCAL}`);
  return admin;
}

async function seedUsers(config: SeedConfig, cityIds: string[]) {
  const passwordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'Admin@123', 10);
  for (let start = 1; start <= config.users; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.users);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: userIdAt(i),
        email: emailForUser(i),
        phoneE164: phoneForUser(i),
        passwordHash,
        phoneCountryCode: '+92',
        isPhoneVerified: true,
        isEmailVerified: true,
        termsAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
        privacyAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
        legalVersion: '2026-04-22',
        displayName: `User ${i}`,
        usernameSlug: `user-${i}`,
        cityId: cityIds[(i - 1) % cityIds.length] ?? null,
        trustLevel: i % 7 === 0 ? 'trusted' : i % 3 === 0 ? 'established' : 'new_user',
        role: i % 15 === 0 ? 'claimed_owner' : 'user',
        status: 'active',
        lastLoginAt: new Date(Date.now() - ((i % 30) + 1) * 86_400_000),
      });
    }
    await prisma.user.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.users) {
      console.log(`   users: ${end.toLocaleString()} / ${config.users.toLocaleString()}`);
    }
  }
  console.log(`✅ Users seeded: ${config.users.toLocaleString()} (+ admin)`);
}

async function seedEntities(
  config: SeedConfig,
  categoryIds: Array<{ id: string; key: string }>,
  cityIds: string[],
  localityIds: string[],
  adminId: string,
) {
  const categoryCount = categoryIds.length;
  for (let start = 1; start <= config.entities; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.entities);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const categoryIdx = (i - 1) % categoryCount;
      const category = categoryIds[categoryIdx];
      const cityId = cityIds[(i - 1) % cityIds.length];
      const localityId = localityIds.length ? localityIds[(i - 1) % localityIds.length] : null;
      const displayName = `${COMPANY_PREFIX[(i - 1) % COMPANY_PREFIX.length]} ${COMPANY_SUFFIX[(i - 1) % COMPANY_SUFFIX.length]} ${i}`;
      const normalizedName = displayName.toLowerCase();
      rows.push({
        id: entityIdAt(i),
        categoryId: category.id,
        displayName,
        normalizedName,
        phoneE164: `+9221${i.toString().padStart(7, '0')}`,
        addressLine: `${(i % 999) + 1} Main Street, ${category.key.replace(/_/g, ' ')}`,
        landmark: `Block ${(i % 40) + 1}`,
        cityId,
        localityId,
        entityFingerprint: hash64(`${normalizedName}:${cityId}:${category.id}`),
        status: 'active',
        isClaimed: i % 2 === 0,
        claimedUserId: i % 2 === 0 ? userIdAt(((i - 1) % config.users) + 1) : null,
        averageRating: ((i % 5) + 1).toString(),
        ratingCount: (i % 150) + 1,
        reviewCount: i % 300,
        trustScore: 40 + (i % 61),
        suspiciousReviewCount: i % 3,
        hiddenReviewCount: i % 2,
        lastReviewedAt: new Date(Date.now() - (i % 120) * 86_400_000),
        createdByUserId: adminId,
      });
    }
    await prisma.entity.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.entities) {
      console.log(`   entities: ${end.toLocaleString()} / ${config.entities.toLocaleString()}`);
    }
  }
  console.log(`✅ Entities seeded: ${config.entities.toLocaleString()}`);
}

async function seedEntityProfiles(config: SeedConfig) {
  if (!config.includeProfilesForEveryEntity) {
    console.log('↪ Skipped entity profile seeding (SEED_ALL_ENTITY_PROFILES=false)');
    return;
  }
  for (let start = 1; start <= config.entities; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.entities);
    const employerRows = [];
    const schoolRows = [];
    const medicalRows = [];
    const productRows = [];
    for (let i = start; i <= end; i += 1) {
      const eid = entityIdAt(i);
      employerRows.push({
        id: makeDeterministicUuid('seed-employer-profile', i),
        entityId: eid,
        description: `Employer profile for entity ${i}`,
        industry: i % 2 === 0 ? 'Technology' : 'Manufacturing',
        employerSize: i % 3 === 0 ? 'medium' : i % 5 === 0 ? 'large' : 'small',
        foundedYear: 1990 + (i % 30),
        benefitsJson: ['Health Insurance', 'Annual Bonus'],
        socialLinksJson: { linkedin: `https://linkedin.com/company/entity-${i}` },
        isVerified: i % 4 === 0,
        verifiedAt: i % 4 === 0 ? new Date('2026-01-01T00:00:00.000Z') : null,
        verifiedMethod: i % 4 === 0 ? 'manual_review' : null,
      });
      schoolRows.push({
        id: makeDeterministicUuid('seed-school-profile', i),
        entityId: eid,
        description: `School profile for entity ${i}`,
        schoolType: i % 2 === 0 ? 'private' : 'public',
        curriculum: i % 3 === 0 ? 'matric' : 'cambridge',
        feeRangeMin: 5000 + (i % 10000),
        feeRangeMax: 20000 + (i % 30000),
        foundedYear: 1980 + (i % 35),
        totalStudents: 200 + (i % 5000),
        facilitiesJson: ['Library', 'Sports Ground'],
        branchesJson: [`Branch-${(i % 10) + 1}`],
        isVerified: i % 6 === 0,
        verifiedAt: i % 6 === 0 ? new Date('2026-02-01T00:00:00.000Z') : null,
      });
      medicalRows.push({
        id: makeDeterministicUuid('seed-medical-profile', i),
        entityId: eid,
        description: `Medical profile for entity ${i}`,
        specialization: i % 2 === 0 ? 'General Physician' : 'Cardiology',
        qualifications: 'MBBS, FCPS',
        experienceYears: 5 + (i % 25),
        hospitalAffiliation: `Hospital ${(i % 100) + 1}`,
        consultationFee: 1000 + (i % 4000),
        timingsJson: { mon_fri: '09:00-17:00' },
        servicesJson: ['Consultation', 'Follow-up'],
        isVerified: i % 5 === 0,
        verifiedAt: i % 5 === 0 ? new Date('2026-03-01T00:00:00.000Z') : null,
        pmdcNumber: `PMDC-${i.toString().padStart(8, '0')}`,
      });
      productRows.push({
        id: makeDeterministicUuid('seed-product-profile', i),
        entityId: eid,
        description: `Product profile for entity ${i}`,
        brand: `Brand ${(i % 1000) + 1}`,
        variantsJson: [`Variant ${(i % 5) + 1}`],
        nutritionJson: { calories: 120 + (i % 120) },
        productCategory: i % 2 === 0 ? 'Food' : 'Consumer',
        barcode: `BAR${i.toString().padStart(10, '0')}`,
        isVerified: i % 7 === 0,
        verifiedAt: i % 7 === 0 ? new Date('2026-04-01T00:00:00.000Z') : null,
      });
    }
    await prisma.$transaction([
      prisma.employerProfile.createMany({ data: employerRows, skipDuplicates: true }),
      prisma.schoolProfile.createMany({ data: schoolRows, skipDuplicates: true }),
      prisma.medicalProfile.createMany({ data: medicalRows, skipDuplicates: true }),
      prisma.productProfile.createMany({ data: productRows, skipDuplicates: true }),
    ]);
    if (end % (config.batchSize * 10) === 0 || end === config.entities) {
      console.log(`   entity profiles: ${end.toLocaleString()} / ${config.entities.toLocaleString()} entities`);
    }
  }
  console.log(`✅ Entity profiles seeded for all entities: ${config.entities.toLocaleString()}`);
}

async function seedReviews(config: SeedConfig, categoryCount: number) {
  for (let categoryIdx = 0; categoryIdx < categoryCount; categoryIdx += 1) {
    for (let start = 1; start <= config.reviewsPerCategory; start += config.batchSize) {
      const end = Math.min(start + config.batchSize - 1, config.reviewsPerCategory);
      const rows = [];
      for (let i = start; i <= end; i += 1) {
        const userIndex = ((i - 1) % config.users) + 1;
        const entityIndex = entityIndexForCategory(categoryIdx, i - 1, config.entities, categoryCount);
        rows.push({
          id: reviewId(categoryIdx, i),
          entityId: entityIdAt(entityIndex),
          authorUserId: userIdAt(userIndex),
          overallRating: (i % 5) + 1,
          title: `Review ${i} for category ${categoryIdx + 1}`,
          body: `${REVIEW_SNIPPETS[(i - 1) % REVIEW_SNIPPETS.length]} [synthetic-${categoryIdx + 1}-${i}]`,
          visitContext: i % 2 === 0 ? 'in_person' : 'online',
          experienceMonth: ((i - 1) % 12) + 1,
          experienceYear: 2023 + (i % 4),
          languageCode: 'en',
          status: 'published',
          moderationState: 'clean',
          riskState: i % 21 === 0 ? 'suspicious' : 'clean',
          helpfulCount: i % 100,
          notHelpfulCount: i % 20,
          fakeVoteCount: i % 5,
          underVerification: i % 40 === 0,
          evidenceUrls: [],
          publishedAt: new Date(Date.now() - (i % 180) * 86_400_000),
        });
      }
      await prisma.review.createMany({ data: rows, skipDuplicates: true });
      if (end === config.reviewsPerCategory || end % (config.batchSize * 20) === 0) {
        console.log(`   reviews[c${categoryIdx + 1}]: ${end.toLocaleString()} / ${config.reviewsPerCategory.toLocaleString()}`);
      }
    }
  }
  console.log(`✅ Reviews seeded: ${(config.reviewsPerCategory * categoryCount).toLocaleString()} (${config.reviewsPerCategory.toLocaleString()} per category)`);
}

async function seedReviewVotes(config: SeedConfig, categoryCount: number) {
  const totalReviews = totalReviewCount(categoryCount, config.reviewsPerCategory);
  for (let start = 1; start <= config.reviewVotes; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.reviewVotes);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const reviewGlobal = ((i - 1) % totalReviews) + 1;
      const mapping = reviewByGlobalIndex(reviewGlobal, config.reviewsPerCategory);
      rows.push({
        id: makeDeterministicUuid('seed-review-vote', i),
        reviewId: reviewId(mapping.categoryIdx, mapping.reviewIdx),
        voterUserId: userIdAt(((i * 7 - 1) % config.users) + 1),
        voteType: i % 3 === 0 ? 'seems_fake' : i % 2 === 0 ? 'not_helpful' : 'helpful',
      });
    }
    await prisma.reviewVote.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.reviewVotes) {
      console.log(`   review votes: ${end.toLocaleString()} / ${config.reviewVotes.toLocaleString()}`);
    }
  }
  console.log(`✅ Review votes seeded: ${config.reviewVotes.toLocaleString()}`);
}

async function seedReviewComments(config: SeedConfig, categoryCount: number) {
  const totalReviews = totalReviewCount(categoryCount, config.reviewsPerCategory);
  for (let start = 1; start <= config.reviewComments; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.reviewComments);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const reviewGlobal = ((i * 3 - 1) % totalReviews) + 1;
      const mapping = reviewByGlobalIndex(reviewGlobal, config.reviewsPerCategory);
      rows.push({
        id: makeDeterministicUuid('seed-review-comment', i),
        reviewId: reviewId(mapping.categoryIdx, mapping.reviewIdx),
        authorUserId: userIdAt(((i * 11 - 1) % config.users) + 1),
        body: `Comment ${i}: sharing additional context from personal experience.`,
        isAnonymous: i % 8 === 0,
        likeCount: i % 25,
        dislikeCount: i % 8,
      });
    }
    await prisma.reviewComment.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.reviewComments) {
      console.log(`   review comments: ${end.toLocaleString()} / ${config.reviewComments.toLocaleString()}`);
    }
  }
  console.log(`✅ Review comments seeded: ${config.reviewComments.toLocaleString()}`);
}

async function seedReviewCommentReactions(config: SeedConfig) {
  for (let start = 1; start <= config.reviewCommentReactions; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.reviewCommentReactions);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: makeDeterministicUuid('seed-review-comment-reaction', i),
        commentId: makeDeterministicUuid('seed-review-comment', ((i - 1) % config.reviewComments) + 1),
        userId: userIdAt(((i * 13 - 1) % config.users) + 1),
        type: i % 2 === 0 ? 'dislike' : 'like',
      });
    }
    await prisma.reviewCommentReaction.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.reviewCommentReactions) {
      console.log(`   comment reactions: ${end.toLocaleString()} / ${config.reviewCommentReactions.toLocaleString()}`);
    }
  }
  console.log(`✅ Review comment reactions seeded: ${config.reviewCommentReactions.toLocaleString()}`);
}

async function seedReviewReplies(config: SeedConfig, categoryCount: number) {
  const totalReviews = totalReviewCount(categoryCount, config.reviewsPerCategory);
  for (let start = 1; start <= config.reviewReplies; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.reviewReplies);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const reviewGlobal = ((i * 5 - 1) % totalReviews) + 1;
      const mapping = reviewByGlobalIndex(reviewGlobal, config.reviewsPerCategory);
      rows.push({
        id: makeDeterministicUuid('seed-review-reply', i),
        reviewId: reviewId(mapping.categoryIdx, mapping.reviewIdx),
        authorUserId: userIdAt(((i * 17 - 1) % config.users) + 1),
        authorRole: i % 20 === 0 ? 'admin' : i % 3 === 0 ? 'moderator' : 'claimed_owner',
        body: `Reply ${i}: thank you for the feedback, we are improving this process.`,
        status: 'published',
      });
    }
    await prisma.reviewReply.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.reviewReplies) {
      console.log(`   review replies: ${end.toLocaleString()} / ${config.reviewReplies.toLocaleString()}`);
    }
  }
  console.log(`✅ Review replies seeded: ${config.reviewReplies.toLocaleString()}`);
}

async function seedClaims(config: SeedConfig, adminId: string) {
  for (let start = 1; start <= config.claims; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.claims);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const approved = i % 4 !== 0;
      rows.push({
        id: makeDeterministicUuid('seed-claim', i),
        entityId: entityIdAt(((i - 1) % config.entities) + 1),
        requesterUserId: userIdAt(((i * 19 - 1) % config.users) + 1),
        claimType: i % 7 === 0 ? 'manager' : i % 3 === 0 ? 'representative' : 'owner',
        verificationMethod: i % 2 === 0 ? 'phone_otp' : 'document',
        submittedPhone: approved ? ADMIN_PHONE_LOCAL : null,
        submittedDocumentsJson: approved ? { document: `doc-${i}.pdf` } : null,
        status: approved ? 'approved' : 'pending',
        adminNotes: approved ? 'Auto approved by synthetic seed pipeline' : null,
        approvedBy: approved ? adminId : null,
        approvedAt: approved ? new Date('2026-04-22T00:00:00.000Z') : null,
      });
    }
    await prisma.entityClaim.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.claims) {
      console.log(`   claims: ${end.toLocaleString()} / ${config.claims.toLocaleString()}`);
    }
  }
  console.log(`✅ Claims seeded: ${config.claims.toLocaleString()} (approved + pending)`);
}

async function seedFollows(config: SeedConfig) {
  for (let start = 1; start <= config.follows; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.follows);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: makeDeterministicUuid('seed-follow', i),
        followerUserId: userIdAt(((i * 23 - 1) % config.users) + 1),
        targetType: i % 5 === 0 ? 'category' : i % 2 === 0 ? 'user' : 'entity',
        targetId:
          i % 5 === 0
            ? makeDeterministicUuid('seed-follow-category-target', (i % CATEGORY_SEED.length) + 1)
            : i % 2 === 0
              ? userIdAt(((i * 31 - 1) % config.users) + 1)
              : entityIdAt(((i * 29 - 1) % config.entities) + 1),
      });
    }
    await prisma.follow.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.follows) {
      console.log(`   follows: ${end.toLocaleString()} / ${config.follows.toLocaleString()}`);
    }
  }
  console.log(`✅ Follows seeded: ${config.follows.toLocaleString()}`);
}

async function seedDiscussions(config: SeedConfig) {
  for (let start = 1; start <= config.discussions; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.discussions);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: makeDeterministicUuid('seed-discussion', i),
        authorUserId: userIdAt(((i * 37 - 1) % config.users) + 1),
        title: `Community discussion ${i}`,
        body: `This is a seeded community thread ${i} to simulate high-volume real discussions.`,
        isAnonymous: i % 9 === 0,
        status: 'published',
        likeCount: i % 20,
        dislikeCount: i % 6,
        commentCount: i % 15,
      });
    }
    await prisma.discussionPost.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.discussions) {
      console.log(`   discussions: ${end.toLocaleString()} / ${config.discussions.toLocaleString()}`);
    }
  }
  console.log(`✅ Discussions seeded: ${config.discussions.toLocaleString()}`);
}

async function seedDiscussionComments(config: SeedConfig) {
  for (let start = 1; start <= config.discussionComments; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.discussionComments);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: makeDeterministicUuid('seed-discussion-comment', i),
        discussionId: makeDeterministicUuid('seed-discussion', ((i * 3 - 1) % config.discussions) + 1),
        authorUserId: userIdAt(((i * 41 - 1) % config.users) + 1),
        body: `Discussion comment ${i} with realistic user feedback and context.`,
        isAnonymous: i % 10 === 0,
      });
    }
    await prisma.discussionComment.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.discussionComments) {
      console.log(`   discussion comments: ${end.toLocaleString()} / ${config.discussionComments.toLocaleString()}`);
    }
  }
  console.log(`✅ Discussion comments seeded: ${config.discussionComments.toLocaleString()}`);
}

async function seedDiscussionReactions(config: SeedConfig) {
  for (let start = 1; start <= config.discussionReactions; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.discussionReactions);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: makeDeterministicUuid('seed-discussion-reaction', i),
        discussionId: makeDeterministicUuid('seed-discussion', ((i - 1) % config.discussions) + 1),
        userId: userIdAt(((i * 43 - 1) % config.users) + 1),
        type: i % 2 === 0 ? 'dislike' : 'like',
      });
    }
    await prisma.discussionReaction.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.discussionReactions) {
      console.log(`   discussion reactions: ${end.toLocaleString()} / ${config.discussionReactions.toLocaleString()}`);
    }
  }
  console.log(`✅ Discussion reactions seeded: ${config.discussionReactions.toLocaleString()}`);
}

async function seedBlogs(config: SeedConfig) {
  for (let start = 1; start <= config.blogCategories; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.blogCategories);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const name = `Blog Category ${i}`;
      rows.push({ id: makeDeterministicUuid('seed-blog-category', i), name, slug: slugify(name), description: `Synthetic blog category ${i}` });
    }
    await prisma.blogCategory.createMany({ data: rows, skipDuplicates: true });
  }
  console.log(`✅ Blog categories seeded: ${config.blogCategories.toLocaleString()}`);

  for (let start = 1; start <= config.blogTags; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.blogTags);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const name = `Blog Tag ${i}`;
      rows.push({ id: makeDeterministicUuid('seed-blog-tag', i), name, slug: slugify(name) });
    }
    await prisma.blogTag.createMany({ data: rows, skipDuplicates: true });
  }
  console.log(`✅ Blog tags seeded: ${config.blogTags.toLocaleString()}`);

  for (let start = 1; start <= config.blogs; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.blogs);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const title = `How to evaluate trust signals ${i}`;
      const slug = `${slugify(title)}-${i}`;
      const published = i % 5 !== 0;
      rows.push({
        id: makeDeterministicUuid('seed-blog-post', i),
        authorUserId: userIdAt(((i * 47 - 1) % config.users) + 1),
        categoryId: makeDeterministicUuid('seed-blog-category', ((i - 1) % config.blogCategories) + 1),
        title,
        slug,
        excerpt: `Short summary for synthetic blog post ${i}.`,
        content:
          `<p>Seeded blog content ${i} for load testing. It is intentionally human-like and long enough for realistic rendering.</p>` +
          `<p>Readers can compare experiences and learn from community stories.</p>`,
        status: published ? 'PUBLISHED' : 'DRAFT',
        isPublished: published,
        publishedAt: published ? new Date(Date.now() - (i % 180) * 86_400_000) : null,
        readTime: 3 + (i % 12),
        views: i % 50_000,
        seoTitle: `SEO ${title}`,
        seoDescription: `SEO description for post ${i}`,
        keywords: ['experience', 'review', 'trust', `tag-${(i % 100) + 1}`],
        canonicalUrl: `https://reviewhistory.pk/blog/${slug}`,
        authorName: `User ${((i * 47 - 1) % config.users) + 1}`,
      });
    }
    await prisma.blogPost.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.blogs) {
      console.log(`   blogs: ${end.toLocaleString()} / ${config.blogs.toLocaleString()}`);
    }
  }
  console.log(`✅ Blog posts seeded: ${config.blogs.toLocaleString()}`);
}

async function seedCampaigns(config: SeedConfig) {
  for (let start = 1; start <= config.campaigns; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.campaigns);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const startsAt = new Date(Date.now() - (i % 30) * 86_400_000);
      const endsAt = new Date(startsAt.getTime() + (30 + (i % 60)) * 86_400_000);
      rows.push({
        id: makeDeterministicUuid('seed-campaign', i),
        title: `Community Campaign ${i}`,
        description: `Synthetic campaign ${i} encouraging trustworthy experience sharing.`,
        categoryKey: CATEGORY_SEED[(i - 1) % CATEGORY_SEED.length].key,
        targetGoal: 100 + (i % 50_000),
        status: i % 10 === 0 ? 'ended' : i % 4 === 0 ? 'draft' : 'active',
        startsAt,
        endsAt,
      });
    }
    await prisma.campaign.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.campaigns) {
      console.log(`   campaigns: ${end.toLocaleString()} / ${config.campaigns.toLocaleString()}`);
    }
  }
  console.log(`✅ Campaigns seeded: ${config.campaigns.toLocaleString()}`);

  for (let start = 1; start <= config.campaignParticipants; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.campaignParticipants);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      rows.push({
        id: makeDeterministicUuid('seed-campaign-participant', i),
        campaignId: makeDeterministicUuid('seed-campaign', ((i - 1) % config.campaigns) + 1),
        userId: userIdAt(((i * 53 - 1) % config.users) + 1),
        progress: i % 100,
        completedAt: i % 7 === 0 ? new Date('2026-04-01T00:00:00.000Z') : null,
      });
    }
    await prisma.campaignParticipant.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.campaignParticipants) {
      console.log(`   campaign participants: ${end.toLocaleString()} / ${config.campaignParticipants.toLocaleString()}`);
    }
  }
  console.log(`✅ Campaign participants seeded: ${config.campaignParticipants.toLocaleString()}`);
}

async function seedResponseTemplates(config: SeedConfig) {
  for (let start = 1; start <= config.responseTemplates; start += config.batchSize) {
    const end = Math.min(start + config.batchSize - 1, config.responseTemplates);
    const rows = [];
    for (let i = start; i <= end; i += 1) {
      const sentiment = i % 3 === 0 ? 'neutral' : i % 2 === 0 ? 'negative' : 'positive';
      const category = CATEGORY_SEED[(i - 1) % CATEGORY_SEED.length].key;
      rows.push({
        id: makeDeterministicUuid('seed-response-template', i),
        categoryKey: category,
        sentiment,
        titleEn: `Template ${i} (${sentiment})`,
        titleUr: `ٹیمپلیٹ ${i}`,
        bodyEn: `Thank you for sharing your experience. This is synthetic template #${i} for ${category}.`,
        bodyUr: `آپ کے تجربے کا شکریہ۔ یہ نمونہ ٹیمپلیٹ ${i} ہے۔`,
        isActive: true,
        sortOrder: i,
      });
    }
    await prisma.responseTemplate.createMany({ data: rows, skipDuplicates: true });
    if (end % (config.batchSize * 10) === 0 || end === config.responseTemplates) {
      console.log(`   response templates: ${end.toLocaleString()} / ${config.responseTemplates.toLocaleString()}`);
    }
  }
  console.log(`✅ Response templates seeded: ${config.responseTemplates.toLocaleString()}`);
}

async function main() {
  const config = loadConfig();
  console.log('🌱 Massive seed started');
  console.log('⚠️ This profile is intentionally very large and can take hours/days at million-scale.');
  console.log(`   batchSize=${config.batchSize.toLocaleString()}`);

  if (config.resetExisting) {
    await cleanupExistingData();
  }

  await seedCountryData(prisma);
  console.log('✅ Country/State/City data ensured');

  const cities = await prisma.city.findMany({
    where: { isActive: true, country: { isoCode: 'PK' } },
    select: { id: true },
    take: 500,
  });
  if (!cities.length) {
    throw new Error('No active PK cities found after country seeding.');
  }

  const localities = await prisma.locality.findMany({
    where: { isActive: true },
    select: { id: true },
    take: 5000,
  });

  const categoryIds = await ensureCategories();
  const admin = await ensureAdmin();
  const cityIds = cities.map((c) => c.id);
  const localityIds = localities.map((l) => l.id);

  await seedUsers(config, cityIds);
  await seedEntities(config, categoryIds, cityIds, localityIds, admin.id);
  await seedEntityProfiles(config);
  await seedReviews(config, categoryIds.length);
  await seedReviewVotes(config, categoryIds.length);
  await seedReviewComments(config, categoryIds.length);
  await seedReviewCommentReactions(config);
  await seedReviewReplies(config, categoryIds.length);
  await seedClaims(config, admin.id);
  await seedFollows(config);
  await seedDiscussions(config);
  await seedDiscussionComments(config);
  await seedDiscussionReactions(config);
  await seedBlogs(config);
  await seedCampaigns(config);
  await seedResponseTemplates(config);

  console.log('✅ Massive seed complete');
  console.log(`   Admin email: ${ADMIN_EMAIL}`);
  console.log(`   Admin password: ${process.env.SEED_ADMIN_PASSWORD || 'Krishna!@12!@'}`);
  console.log(`   Bulk user password: ${process.env.SEED_USER_PASSWORD || 'Admin@123'}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

