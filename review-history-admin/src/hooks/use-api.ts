import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import type { User, PaginatedResponse, Review, Notification, Category } from '@/types';

function toPaginated<T>(payload: any): PaginatedResponse<T> {
  if (payload?.data && payload?.meta) {
    return payload as PaginatedResponse<T>;
  }

  const items = payload?.items ?? [];
  const total = Number(payload?.total ?? items.length);
  const page = Number(payload?.page ?? 1);
  const pageSize = Number(payload?.pageSize ?? (items.length || 20));

  return {
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / Math.max(pageSize, 1))),
    },
  };
}

function mapAdminUser(user: any): User {
  return {
    id: user.id,
    phone: user.phone ?? user.phoneE164 ?? '',
    displayName: user.displayName ?? null,
    bio: user.bio ?? null,
    city: user.city ?? null,
    trustLevel: user.trustLevel,
    status: user.status,
    role: user.role,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
  };
}

// Admin: Dashboard
export interface AdminDashboard {
  totalUsers: number;
  totalEntities: number;
  totalReviews: number;
  pendingClaims: number;
  openModerationCases: number;
  recentReviews: Review[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const data = await apiGet<any>('/admin/dashboard');
      return {
        totalUsers: Number(data.totalUsers ?? 0),
        totalEntities: Number(data.totalEntities ?? 0),
        totalReviews: Number(data.totalReviews ?? 0),
        pendingClaims: Number(data.pendingClaims ?? 0),
        openModerationCases: Number(data.openModerationCases ?? data.pendingModeration ?? 0),
        recentReviews: Array.isArray(data.recentReviews) ? data.recentReviews : [],
      } as AdminDashboard;
    },
  });
}

// Admin: Users
export function useAdminUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/users', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapAdminUser),
      } as PaginatedResponse<User>;
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiPatch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });
}

// Admin: Moderation
export interface ModerationCase {
  id: string;
  type: string;
  status: 'open' | 'in_review' | 'resolved' | 'dismissed' | 'closed';
  severity: string;
  reviewId: string | null;
  entityId: string | null;
  description: string;
  openedAt: string;
  resolvedAt: string | null;
}

export interface ModerationCaseDetail extends ModerationCase {
  objectType?: string;
  objectId?: string;
  triggerType?: string;
  actions?: Array<{
    id: string;
    actionType: string;
    notes?: string | null;
    performedBy: string;
    createdAt: string;
  }>;
  review?: any | null;
}

function mapModerationCase(item: any): ModerationCase {
  return {
    id: item.id,
    type: item.triggerType ?? item.type ?? item.objectType ?? 'case',
    status: item.status,
    severity: item.severity,
    reviewId: item.objectType === 'review' ? item.objectId : null,
    entityId: item.objectType === 'entity' ? item.objectId : null,
    description: item.description ?? `${item.objectType}:${item.objectId}`,
    openedAt: item.openedAt,
    resolvedAt: item.closedAt ?? null,
  };
}

export function useAdminModerationCases(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['moderationCases', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/moderation/cases', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapModerationCase),
      } as PaginatedResponse<ModerationCase>;
    },
  });
}

export function useAdminModerationCase(id: string) {
  return useQuery({
    queryKey: ['moderationCase', id],
    queryFn: async () => {
      const payload = await apiGet<any>(`/admin/moderation/cases/${id}`);
      return {
        ...mapModerationCase(payload),
        objectType: payload.objectType,
        objectId: payload.objectId,
        triggerType: payload.triggerType,
        actions: payload.actions ?? [],
        review: payload.review ?? null,
      } as ModerationCaseDetail;
    },
    enabled: !!id,
  });
}

export function useResolveModerationCase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { actionType: string; notes?: string }) =>
      apiPatch(`/admin/moderation/cases/${id}/resolve`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moderationCases'] });
      qc.invalidateQueries({ queryKey: ['moderationCase', id] });
      qc.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// Admin: Reviews
export interface AdminReviewListItem {
  id: string;
  overallRating: number;
  title: string | null;
  body: string;
  status: string;
  moderationState: string;
  riskState: string;
  helpfulCount: number;
  notHelpfulCount: number;
  fakeVoteCount: number;
  createdAt: string;
  publishedAt: string | null;
  author: {
    id: string;
    displayName: string | null;
    email: string | null;
    phoneE164: string;
  };
  entity: {
    id: string;
    displayName: string;
    category: { key: string; nameEn: string };
  };
}

export function useAdminReviews(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminReviews', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/reviews', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data as AdminReviewListItem[],
      } as PaginatedResponse<AdminReviewListItem>;
    },
  });
}

export function useAdminReview(id: string) {
  return useQuery({
    queryKey: ['adminReview', id],
    queryFn: () => apiGet<any>(`/admin/reviews/${id}`),
    enabled: !!id,
  });
}

export function useAdminUpdateReviewStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: 'published' | 'hidden' | 'removed' | 'under_verification') =>
      apiPatch(`/admin/reviews/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminReviews'] });
      qc.invalidateQueries({ queryKey: ['adminReview', id] });
      qc.invalidateQueries({ queryKey: ['moderationCase'] });
    },
  });
}

// Admin: Claims
export interface EntityClaim {
  id: string;
  entityId: string;
  entityName: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  verificationMethod: string;
  createdAt: string;
  updatedAt: string;
}

function mapClaim(claim: any): EntityClaim {
  return {
    id: claim.id,
    entityId: claim.entityId,
    entityName: claim.entityName ?? claim.entity?.displayName ?? 'Unknown Entity',
    status: claim.status,
    verificationMethod: claim.verificationMethod,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

export function useAdminClaims(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminClaims', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/claims', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapClaim),
      } as PaginatedResponse<EntityClaim>;
    },
  });
}

export function useAdminResolveClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ claimId, action }: { claimId: string; action: 'approve' | 'reject' }) =>
      apiPatch(`/admin/claims/${claimId}`, { action: action === 'approve' ? 'approved' : 'rejected' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminClaims'] });
      qc.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// Admin: Audit Logs
export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  objectType: string;
  objectId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function mapAuditLog(log: any): AuditLog {
  return {
    id: log.id,
    actorId: log.actorId ?? log.actorUserId ?? '',
    action: log.action,
    objectType: log.objectType,
    objectId: log.objectId,
    metadata: (log.metadata ?? log.metadataJson ?? {}) as Record<string, unknown>,
    createdAt: log.createdAt,
  };
}

export function useAdminAuditLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/audit/logs', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapAuditLog),
      } as PaginatedResponse<AuditLog>;
    },
  });
}

// Admin: Categories
export function useAdminCategories() {
  return useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => apiGet<Category[]>('/admin/categories'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; nameEn: string; nameUr: string; icon?: string; description?: string; isActive?: boolean; sortOrder?: number }) =>
      apiPost<Category>('/admin/categories', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminCategories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; key?: string; nameEn?: string; nameUr?: string; icon?: string; description?: string; isActive?: boolean; sortOrder?: number }) =>
      apiPatch<Category>(`/admin/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminCategories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminCategories'] }),
  });
}

// Admin: Blogs
export interface AdminBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; displayName: string | null };
}

export function useAdminBlogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminBlogs', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/blogs', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data as AdminBlog[],
      } as PaginatedResponse<AdminBlog>;
    },
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      slug?: string;
      excerpt?: string;
      content: string;
      coverImage?: string;
      isPublished?: boolean;
    }) => apiPost<AdminBlog>('/admin/blogs', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminBlogs'] }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      isPublished?: boolean;
    }) => apiPatch<AdminBlog>(`/admin/blogs/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminBlogs'] }),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/blogs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminBlogs'] }),
  });
}

// Notifications
export function useNotifications(params?: Record<string, unknown>, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/notifications', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        unreadCount: Number(payload?.unreadCount ?? 0),
      } as PaginatedResponse<Notification> & { unreadCount: number };
    },
    ...options,
  });
}

// ── Admin: Campaigns ──
export interface AdminCampaign {
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

export function useAdminCampaigns(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminCampaigns', params],
    queryFn: () => apiGet<AdminCampaign[]>('/campaigns', params),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; categoryKey?: string; targetGoal: number; startsAt: string; endsAt: string }) =>
      apiPost<AdminCampaign>('/campaigns', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminCampaigns'] }),
  });
}

export function useActivateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/campaigns/${id}/activate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminCampaigns'] }),
  });
}

export function useCompleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/campaigns/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminCampaigns'] }),
  });
}

// ── Admin: Response Templates ──
export interface ResponseTemplate {
  id: string;
  titleEn: string;
  titleUr?: string | null;
  bodyEn: string;
  bodyUr?: string | null;
  categoryKey: string | null;
  sentiment: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: string;
}

export function useAdminResponseTemplates(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminResponseTemplates', params],
    queryFn: () => apiGet<ResponseTemplate[]>('/response-templates', params),
  });
}

export function useCreateResponseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { titleEn: string; bodyEn: string; categoryKey?: string; sentiment: string; sortOrder?: number }) =>
      apiPost<ResponseTemplate>('/response-templates', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminResponseTemplates'] }),
  });
}

export function useUpdateResponseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; titleEn?: string; titleUr?: string; bodyEn?: string; bodyUr?: string; sentiment?: string; categoryKey?: string; isActive?: boolean }) =>
      apiPatch<ResponseTemplate>(`/response-templates/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminResponseTemplates'] }),
  });
}

export function useDeleteResponseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/response-templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminResponseTemplates'] }),
  });
}

// ── Admin: Badges Recalculation ──
export function useRecalculateUserBadges() {
  return useMutation({
    mutationFn: (userId: string) => apiPost(`/admin/badges/recalculate-user/${userId}`),
  });
}

export function useRecalculateEntityBadges() {
  return useMutation({
    mutationFn: (entityId: string) => apiPost(`/admin/badges/recalculate-entity/${entityId}`),
  });
}

// ── Admin: Claim Detail ──
export interface ClaimDetail extends EntityClaim {
  claimType: string;
  submittedDocumentsJson: any;
  adminNotes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  requester: {
    id: string;
    displayName: string | null;
    phoneE164: string;
    role: string;
    createdAt: string;
  } | null;
  entity: {
    id: string;
    displayName: string;
    slug: string | null;
    category: { key: string; nameEn: string } | null;
  } | null;
}

export function useAdminClaimDetail(claimId: string) {
  return useQuery({
    queryKey: ['adminClaim', claimId],
    queryFn: async () => {
      const data = await apiGet<any>(`/admin/claims/${claimId}`);
      return {
        ...mapClaim(data),
        claimType: data.claimType ?? 'owner',
        submittedDocumentsJson: data.submittedDocumentsJson ?? null,
        adminNotes: data.adminNotes ?? null,
        approvedBy: data.approvedBy ?? null,
        approvedAt: data.approvedAt ?? null,
        requester: data.requester ?? null,
        entity: data.entity ?? null,
      } as ClaimDetail;
    },
    enabled: !!claimId,
  });
}

// ── Admin: Entity Profiles ──
export interface AdminEntityProfile {
  id: string;
  entityId: string;
  entityName: string;
  description: string | null;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

function mapEntityProfile(profile: any): AdminEntityProfile {
  return {
    ...profile,
    entityName: profile.entityName ?? profile.entity?.displayName ?? 'Unknown',
  };
}

export function useAdminEmployerProfiles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminEmployerProfiles', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/admin/employer-profiles', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapEntityProfile),
      } as PaginatedResponse<AdminEntityProfile>;
    },
  });
}

export function useAdminSchoolProfiles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminSchoolProfiles', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/category-extensions/admin/school-profiles', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapEntityProfile),
      } as PaginatedResponse<AdminEntityProfile>;
    },
  });
}

export function useAdminMedicalProfiles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminMedicalProfiles', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/category-extensions/admin/medical-profiles', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapEntityProfile),
      } as PaginatedResponse<AdminEntityProfile>;
    },
  });
}

export function useAdminProductProfiles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['adminProductProfiles', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/category-extensions/admin/product-profiles', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapEntityProfile),
      } as PaginatedResponse<AdminEntityProfile>;
    },
  });
}

export function useVerifyEmployer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entityId: string) => apiPost(`/admin/entities/${entityId}/verify-employer`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminEmployerProfiles'] }),
  });
}
