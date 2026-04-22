// Shared types matching backend API responses

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ── User ──
export type UserRole = 'guest' | 'user' | 'claimed_owner' | 'moderator' | 'admin' | 'super_admin';
export type UserTrustLevel = 'new_user' | 'established' | 'trusted';

export interface User {
  id: string;
  email?: string | null;
  emailVerified?: boolean;
  phone: string;
  displayName: string | null;
  bio: string | null;
  city: string | null;
  trustLevel: UserTrustLevel;
  status: string;
  role: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
}

// ── Auth ──
export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface OtpRequestResponse {
  otpRequestId: string;
  cooldownSeconds: number;
  otpCode?: string;
}

export interface EmailOtpChallengeResponse {
  otpRequestId: string;
  cooldownSeconds: number;
  otpCode?: string;
  email: string;
  requiresVerification: boolean;
  loginReason?: 'email_not_verified';
}

export interface LoginSuccessResponse {
  requiresVerification: false;
  loginReason?: 'none';
  accessToken: string;
  user: User;
}

export type AuthLoginResponse = EmailOtpChallengeResponse | LoginSuccessResponse;

export interface VerifyOtpResponse {
  accessToken: string;
  user: User;
}

// ── Category ──
export interface Category {
  id: string;
  key: string;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface WarningTag {
  id: string;
  key: string;
  label: string;
  isPositive: boolean;
  severityWeight: number;
}

// ── City & Locality ──
export interface City {
  id: string;
  name: string;
  nameEn?: string;
  nameUr?: string | null;
  province?: string | null;
  country?: {
    id: string;
    name: string;
    isoCode: string;
    phoneCode?: string | null;
    currency?: string | null;
  } | null;
  state?: {
    id: string;
    name: string;
    isoCode: string;
  } | null;
  timezone?: {
    id: string;
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation?: string | null;
    tzName?: string | null;
  } | null;
}

export interface Locality {
  id: string;
  name: string;
  cityId: string;
}

// ── Entity ──
export type EntityStatus = 'draft' | 'active' | 'claimed' | 'under_review' | 'merged' | 'suspended' | 'archived';

export interface Entity {
  id: string;
  name: string;
  address: string | null;
  averageRating: number;
  reviewCount: number;
  trustScore: number;
  status: EntityStatus;
  isClaimed: boolean;
  categoryKey: string;
  categoryName?: string;
  city: string;
  locality: string | null;
  createdAt: string;
}

export interface EntityDetail extends Entity {
  description: string | null;
  phone: string | null;
  landmark: string | null;
  warningTags: string[];
  aliases: string[];
}

// ── Review ──
export type ReviewStatus = 'draft' | 'submitted' | 'published' | 'under_verification' | 'hidden' | 'removed' | 'archived';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isAnonymous?: boolean;
  authorId?: string;
  authorName: string | null;
  status: ReviewStatus;
  helpfulCount: number;
  unhelpfulCount: number;
  fakeVoteCount?: number;
  publishedAt: string | null;
  createdAt: string;
  tags: string[];
  replies: ReviewReply[];
  comments?: ReviewComment[];
  commentCount?: number;
}

export interface ReviewReply {
  id: string;
  body: string;
  authorName: string | null;
  authorRole: string;
  createdAt: string;
}

export interface ReviewComment {
  id: string;
  body: string;
  isAnonymous: boolean;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  author: {
    id: string | null;
    displayName: string;
  };
}

// ── Feed Review (review + entity context) ──
export interface FeedReview {
  id: string;
  overallRating: number;
  title: string | null;
  body: string;
  isAnonymous: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  unhelpfulCount: number;
  fakeVoteCount: number;
  publishedAt: string | null;
  createdAt: string;
  userVote?: 'helpful' | 'not_helpful' | null;
  author: {
    id: string | null;
    displayName: string;
    trustLevel: string | null;
  };
  entity: {
    id: string;
    name: string;
    averageRating: number;
    reviewCount: number;
    trustScore: number;
    address: string | null;
    categoryKey: string;
    categoryName: string;
    categoryIcon: string | null;
    city: string;
  };
  tags: { key: string; label: string; isPositive: boolean }[];
  replies: ReviewReply[];
  comments?: ReviewComment[];
  commentCount?: number;
}

// —— Blogs ——
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  coverImage: string | null;
  featuredImage?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  readTime?: number | null;
  views?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string[];
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  author: {
    id: string;
    displayName: string | null;
  };
}

// —— Discussions ——
export interface DiscussionComment {
  id: string;
  body: string;
  isAnonymous: boolean;
  createdAt: string;
  author: {
    id: string | null;
    displayName: string;
  };
}

export interface DiscussionPost {
  id: string;
  title: string | null;
  body: string;
  isAnonymous: boolean;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  userReaction?: 'like' | 'dislike' | null;
  author: {
    id: string | null;
    displayName: string;
  };
  comments: DiscussionComment[];
}

// ── Vote ──
export type VoteType = 'helpful' | 'unhelpful' | 'not_helpful' | 'seems_fake' | 'fake';

export interface VoteSummary {
  helpful: number;
  unhelpful: number;
  seemsFake: number;
  userVote: VoteType | null;
}

// ── Notification ──
export interface Notification {
  id: string;
  type: string;
  message: string;
  payload?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

// ── Badge ──
export type BadgeType =
  | 'first_review' | 'five_reviews' | 'ten_reviews' | 'fifty_reviews'
  | 'streak_7' | 'streak_30' | 'community_helper' | 'verified_reviewer'
  | 'quality_reviewer' | 'top_contributor'
  | 'employee_trusted' | 'fast_responder' | 'responsive_employer' | 'verified_employer'
  | 'school_rated' | 'doctor_rated' | 'product_rated' | 'highly_rated';

export interface UserBadge {
  id: string;
  badgeType: BadgeType;
  awardedAt: string;
  isPermanent: boolean;
}

export interface EntityBadge {
  id: string;
  badgeType: BadgeType;
  awardedAt: string;
}

// ── Entity Response Metrics ──
export interface ResponseMetrics {
  id: string;
  entityId: string;
  responseRate: number;
  avgResponseTimeHours: number;
  issuesResolvedCount: number;
}

// ── Category Profile Extensions ──
export interface EmployerProfile {
  id: string;
  entityId: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  websiteUrl: string | null;
  industry: string | null;
  employerSize: string | null;
  foundedYear: number | null;
  benefits: string[];
  socialLinks: Record<string, string>;
  isVerified: boolean;
  profileCompletion: number;
}

export interface SchoolProfile {
  id: string;
  entityId: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  schoolType: string | null;
  curriculum: string | null;
  feeRangeMin: number | null;
  feeRangeMax: number | null;
  foundedYear: number | null;
  totalStudents: number | null;
  facilities: string[];
  branches: string[];
}

export interface MedicalProfile {
  id: string;
  entityId: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  specialization: string | null;
  qualifications: string | null;
  experienceYears: number | null;
  hospitalAffiliation: string | null;
  consultationFee: number | null;
  pmdcNumber: string | null;
  timings: Record<string, string>;
  services: string[];
}

export interface ProductProfile {
  id: string;
  entityId: string;
  description: string | null;
  brand: string | null;
  imageUrl: string | null;
  productCategory: string | null;
  barcode: string | null;
  variants: string[];
  nutrition: Record<string, unknown>;
}

export type CategoryProfile = EmployerProfile | SchoolProfile | MedicalProfile | ProductProfile | null;

// ── Follow ──
export interface FollowTarget {
  id: string;
  displayName?: string;
  nameEn?: string;
  key?: string;
  icon?: string;
  averageRating?: number | string | null;
  reviewCount?: number;
}

export interface Follow {
  id: string;
  targetType: 'entity' | 'category';
  targetId: string;
  targetName?: string;
  target?: FollowTarget | null;
  createdAt: string;
}

// ── Review Streak ──
export interface ReviewStreak {
  currentStreak: number;
  longestStreak: number;
  lastReviewDate: string | null;
  lastActiveDate?: string | null;
  weeklyCount?: number;
  totalPoints?: number;
  activeDaysCount?: number;
  feedVisitCount?: number;
  discussionVisitCount?: number;
  communityVisitCount?: number;
  activeMinutes?: number;
  listingsAddedCount?: number;
  reviewsAddedCount?: number;
  followsCount?: number;
  sharesCount?: number;
  discussionPostsCount?: number;
  discussionCommentsCount?: number;
  likesCount?: number;
  validationsCount?: number;
}

// ── Campaign ──
export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  categoryKey: string | null;
  targetGoal: number;
  status: 'draft' | 'active' | 'ended';
  startsAt: string;
  endsAt: string;
  createdAt: string;
  _count?: { participants: number };
}

// ── Community Validation ──
export interface CommunityValidationSummary {
  confirmed: number;
  outdated: number;
  resolved: number;
  total: number;
}

// ── Onboarding ──
export interface OnboardingPreference {
  categoryKeys: string[];
  selectedCityId: string | null;
  isComplete: boolean;
}

// ── Review Quality ──
export interface ReviewQualityScore {
  totalScore: number;
  lengthScore: number;
  detailScore: number;
  balanceScore: number;
  helpfulRatio: number;
}
