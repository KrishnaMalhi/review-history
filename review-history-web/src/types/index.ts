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
}

export interface EmailOtpChallengeResponse {
  otpRequestId: string;
  cooldownSeconds: number;
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
}

export interface ReviewReply {
  id: string;
  body: string;
  authorName: string | null;
  authorRole: string;
  createdAt: string;
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
