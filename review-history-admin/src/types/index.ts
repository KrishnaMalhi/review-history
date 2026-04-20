// Types for admin panel

export type UserRole = 'guest' | 'user' | 'claimed_owner' | 'moderator' | 'admin' | 'super_admin';

export interface User {
  id: string;
  phone: string;
  displayName: string | null;
  bio: string | null;
  city: string | null;
  trustLevel: string;
  status: string;
  role: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  user: User;
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

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isAnonymous: boolean;
  authorName: string | null;
  status: string;
  helpfulCount: number;
  unhelpfulCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  key: string;
  nameEn: string;
  nameUr: string;
  icon: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    warningTags: number;
    entities: number;
  };
}
