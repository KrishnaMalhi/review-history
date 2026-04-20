import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import type {
  Entity,
  EntityDetail,
  Review,
  Category,
  WarningTag,
  City,
  Locality,
  PaginatedResponse,
  Notification,
  FeedReview,
} from '@/types';

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

function mapEntity(entity: any): Entity {
  return {
    id: entity.id,
    name: entity.name ?? entity.displayName ?? '',
    address: entity.address ?? entity.addressLine ?? null,
    averageRating: Number(entity.averageRating ?? 0),
    reviewCount: Number(entity.reviewCount ?? 0),
    trustScore: Number(entity.trustScore ?? 0),
    status: entity.status,
    isClaimed: Boolean(entity.isClaimed),
    categoryKey: entity.categoryKey,
    categoryName: entity.categoryName,
    city: entity.city,
    locality: entity.locality ?? null,
    createdAt: entity.createdAt,
  };
}

function mapEntityDetail(entity: any): EntityDetail {
  const aliases = Array.isArray(entity.aliases)
    ? entity.aliases
        .map((alias: any) => alias?.aliasText ?? alias)
        .filter((value: unknown): value is string => typeof value === 'string')
    : [];

  return {
    ...mapEntity(entity),
    description: entity.description ?? null,
    phone: entity.phone ?? null,
    landmark: entity.landmark ?? null,
    warningTags: Array.isArray(entity.warningTags) ? entity.warningTags : [],
    aliases,
  };
}

function mapReview(review: any): Review {
  return {
    id: review.id,
    rating: Number(review.rating ?? review.overallRating ?? 0),
    title: review.title ?? null,
    body: review.body,
    isAnonymous: review.isAnonymous,
    authorId: review.authorId ?? review.author?.id,
    authorName: review.authorName ?? review.author?.displayName ?? null,
    status: review.status,
    helpfulCount: Number(review.helpfulCount ?? 0),
    unhelpfulCount: Number(review.unhelpfulCount ?? review.notHelpfulCount ?? 0),
    fakeVoteCount: Number(review.fakeVoteCount ?? 0),
    publishedAt: review.publishedAt ?? null,
    createdAt: review.createdAt,
    tags: Array.isArray(review.tags)
      ? review.tags.map((tag: any) => (typeof tag === 'string' ? tag : tag?.key ?? tag?.labelEn ?? '')).filter(Boolean)
      : [],
    replies: Array.isArray(review.replies)
      ? review.replies.map((reply: any) => ({
          id: reply.id,
          body: reply.body,
          authorName: reply.authorName ?? reply.author?.displayName ?? null,
          authorRole: reply.authorRole,
          createdAt: reply.createdAt,
        }))
      : [],
  };
}

function mapNotification(notification: any): Notification {
  const payload = notification.payloadJson ?? null;
  const message = notification.message
    ?? payload?.message
    ?? payload?.title
    ?? payload?.body
    ?? String(notification.type ?? 'Notification');

  return {
    id: notification.id,
    type: notification.type,
    message,
    payload,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
  };
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });
}

export function useCategoryTags(categoryKey: string) {
  return useQuery({
    queryKey: ['categoryTags', categoryKey],
    queryFn: () => apiGet<WarningTag[]>(`/categories/${categoryKey}/tags`),
    enabled: !!categoryKey,
  });
}

// Cities & Localities
export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const cities = await apiGet<City[]>('/cities');
      const hasCountryMeta = cities.some((city) => !!city.country?.isoCode);
      if (!hasCountryMeta) return cities;
      return cities.filter((city) => city.country?.isoCode === 'PK');
    },
  });
}

export function useLocalities(cityId: string) {
  return useQuery({
    queryKey: ['localities', cityId],
    queryFn: () => apiGet<Locality[]>(`/cities/${cityId}/localities`),
    enabled: !!cityId,
  });
}

// Feed (infinite scroll)
export function useInfiniteFeedReviews(params: Record<string, unknown>) {
  const pageSize = Number(params.pageSize) || 10;
  return useInfiniteQuery({
    queryKey: ['feedReviews', params],
    queryFn: async ({ pageParam = 1 }) => {
      const payload = await apiGet<any>('/reviews/feed', { ...params, page: pageParam, pageSize });
      return toPaginated<FeedReview>(payload);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}

// Entity Search
export function useSearchEntities(params: Record<string, unknown>) {
  return useQuery({
    queryKey: ['searchEntities', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/search/entities', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapEntity),
      } as PaginatedResponse<Entity>;
    },
  });
}

// Entity Detail
export function useEntity(id: string) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: async () => mapEntityDetail(await apiGet<any>(`/entities/${id}`)),
    enabled: !!id,
  });
}

// Entity Reviews
export function useEntityReviews(entityId: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['entityReviews', entityId, params],
    queryFn: async () => {
      const payload = await apiGet<any>(`/entities/${entityId}/reviews`, params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapReview),
      } as PaginatedResponse<Review>;
    },
    enabled: !!entityId,
  });
}

// Create Entity
export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost<{ entityId: string }>('/entities', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['searchEntities'] }),
  });
}

// Create Review
export function useCreateReview(entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiPost<{ reviewId: string }>(`/entities/${entityId}/reviews`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entityReviews', entityId] });
      qc.invalidateQueries({ queryKey: ['entity', entityId] });
    },
  });
}

// Vote
export function useVote(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (voteType: string) => apiPost(`/reviews/${reviewId}/votes`, { voteType }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entityReviews'] }),
  });
}

// Report
export function useReportReview(reviewId: string) {
  return useMutation({
    mutationFn: (data: { reportType: string; description?: string }) =>
      apiPost(`/reviews/${reviewId}/reports`, data),
  });
}

// Update Review
export function useUpdateReview(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; body?: string; overallRating?: number }) =>
      apiPatch(`/reviews/${reviewId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entityReviews'] });
      qc.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Delete Review
export function useDeleteReview(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete(`/reviews/${reviewId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entityReviews'] });
      qc.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

// Reply
export function useCreateReply(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => apiPost(`/reviews/${reviewId}/replies`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entityReviews'] }),
  });
}

// Notifications
export function useNotifications(
  params?: Record<string, unknown>,
  options?: { refetchInterval?: number | false; enabled?: boolean },
) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/notifications', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapNotification),
        unreadCount: Number(payload?.unreadCount ?? 0),
      } as PaginatedResponse<Notification> & { unreadCount: number };
    },
    ...options,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// My Reviews
export function useMyReviews(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['myReviews', params],
    queryFn: async () => {
      const payload = await apiGet<any>('/me/reviews', params);
      const paginated = toPaginated<any>(payload);
      return {
        ...paginated,
        data: paginated.data.map(mapReview),
      } as PaginatedResponse<Review>;
    },
  });
}

// Entity Claims
export interface EntityClaim {
  id: string;
  entityId: string;
  entityName: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  verificationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export function useMyClaims() {
  return useQuery({
    queryKey: ['myClaims'],
    queryFn: async () => {
      const claims = await apiGet<any[]>('/me/claims');
      return claims.map((claim) => ({
        id: claim.id,
        entityId: claim.entityId,
        entityName: claim.entity?.displayName ?? claim.entityName ?? 'Unknown Entity',
        status: claim.status,
        verificationMethod: claim.verificationMethod,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      })) as EntityClaim[];
    },
  });
}

export function useCreateClaim(entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationMethod: string; evidenceUrl?: string }) =>
      apiPost(`/entities/${entityId}/claims`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myClaims'] });
      qc.invalidateQueries({ queryKey: ['entity', entityId] });
    },
  });
}

// Trust Score
export interface TrustScoreBreakdown {
  overall: number;
  baseRating: number;
  volumeConfidence: number;
  consistency: number;
  recency: number;
  responsiveness: number;
  warningPenalty: number;
  suspiciousPenalty: number;
  moderationPenalty: number;
}

export function useEntityTrustScore(entityId: string) {
  return useQuery({
    queryKey: ['trustScore', entityId],
    queryFn: () => apiGet<TrustScoreBreakdown>(`/entities/${entityId}/trust`),
    enabled: !!entityId,
  });
}

// Saved Entities (Bookmarks)
export function useSavedEntities() {
  return useQuery({
    queryKey: ['savedEntities'],
    queryFn: async () => (await apiGet<any[]>('/me/saved-entities')).map(mapEntity),
  });
}

export function useSaveEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entityId: string) => apiPost(`/me/saved-entities/${entityId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savedEntities'] }),
  });
}

export function useUnsaveEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entityId: string) => apiDelete(`/me/saved-entities/${entityId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savedEntities'] }),
  });
}
