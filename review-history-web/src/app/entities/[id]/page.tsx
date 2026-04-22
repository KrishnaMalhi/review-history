'use client';

import { use, useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { MapPin, Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, AlertTriangle, Pencil, Trash2, ChevronDown, ChevronUp, ShieldAlert, Bookmark, BookmarkCheck, Search, SlidersHorizontal, SendHorizontal } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import {
  Card, CardContent, Badge, Button, StarRating,
  Skeleton, ReviewSkeleton, EmptyState,
} from '@/components/ui';
import { useEntity, useEntityReviews, useEntityTrustScore, useVote, useReportReview, useCreateReply, useCreateClaim, useUpdateReview, useDeleteReview, useSavedEntities, useSaveEntity, useUnsaveEntity, useEntityBadges, useResponseMetrics, useCategoryProfile, useTrackPageView, useMyClaims, useReviewComments, useAddReviewComment, useReactReviewComment } from '@/hooks/use-api';
import { useReviewInteractionSocket } from '@/hooks/use-socket';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime, ratingColor, ratingBgColor } from '@/lib/utils';
import { TrustScoreBadge, TrustScoreBreakdown } from '@/components/shared/trust-score';
import { useToast } from '@/components/shared/toast';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { EntityBadgeDisplay } from '@/components/shared/badge-display';
import { ResponseMetricsBar } from '@/components/shared/response-metrics-bar';
import { FollowButton } from '@/components/shared/follow-button';
import { CategoryProfileCard } from '@/components/shared/category-profile-card';
import { CommunityValidation } from '@/components/shared/community-validation';
import type { Review, ReviewComment } from '@/types';
import Link from 'next/link';
import { FIELD_LIMITS } from '@shared/field-limits';

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

function resolveClaimSubmitError(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  const status = axiosError?.response?.status;
  const message = axiosError?.response?.data?.error?.message;

  if (status === 409) {
    return message || 'You already have a claim for this entity.';
  }

  return message || 'Failed to submit claim.';
}

export default function EntityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const { data: entity, isLoading: entityLoading } = useEntity(id);
  const { data: trustScore } = useEntityTrustScore(id);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [reviewQuery, setReviewQuery] = useState('');
  const [minReviewRating, setMinReviewRating] = useState<number | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const claimMutation = useCreateClaim(id);
  const { data: savedEntities } = useSavedEntities();
  const saveEntity = useSaveEntity();
  const unsaveEntity = useUnsaveEntity();
  const isSaved = savedEntities?.some((e) => e.id === id) ?? false;
  const toast = useToast();
  const { data: reviews, isLoading: reviewsLoading } = useEntityReviews(id, {
    page: reviewPage,
    limit: 10,
    sort: reviewSort,
  });
  const { data: entityBadges } = useEntityBadges(id);
  const { data: responseMetrics } = useResponseMetrics(id);
  const { data: categoryProfile } = useCategoryProfile(id);
  const { data: myClaims } = useMyClaims();
  const trackPageView = useTrackPageView();
  const claimForEntity = myClaims?.find((claim) => claim.entityId === id);
  const hasApprovedClaim = claimForEntity?.status === 'approved';
  const hasPendingClaim = claimForEntity?.status === 'pending';

  useEffect(() => {
    trackPageView.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filteredReviews = useMemo(() => {
    const rows = reviews?.data ?? [];
    return rows.filter((review) => {
      const matchesText = reviewQuery.trim().length === 0
        || review.body.toLowerCase().includes(reviewQuery.trim().toLowerCase())
        || (review.title ?? '').toLowerCase().includes(reviewQuery.trim().toLowerCase());
      const matchesRating = minReviewRating == null || review.rating >= minReviewRating;
      return matchesText && matchesRating;
    });
  }, [reviews?.data, reviewQuery, minReviewRating]);

  if (entityLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!entity) {
    return (
      <PublicLayout>
        <EmptyState title="Entity not found" description="This entity may have been removed." />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: entity.name,
          ...(entity.address && { address: { '@type': 'PostalAddress', streetAddress: entity.address } }),
          ...(entity.averageRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: entity.averageRating,
              bestRating: 5,
              worstRating: 1,
              ratingCount: entity.reviewCount || 0,
              reviewCount: entity.reviewCount || 0,
            },
          }),
          ...(reviews?.data?.length && {
            review: reviews.data.slice(0, 5).map((r) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: 'Anonymous' },
              datePublished: r.createdAt,
              reviewBody: r.body,
              reviewRating: {
                '@type': 'Rating',
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
              },
            })),
          }),
        }}
      />
      <div className="relative overflow-hidden bg-surface min-h-screen">
      <div className="blob-green absolute -top-20 right-20 h-48 w-48 opacity-20" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search', href: '/search' }, { label: entity.name }]} />
        {/* Entity Header - Enhanced design */}
        <div className="mb-8 rounded-2xl border border-border/80 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{entity.name}</h1>
              {entity.address && (
                <p className="mt-1.5 flex items-center gap-1 text-muted">
                  <MapPin className="h-4 w-4" /> {entity.address}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {trustScore && <TrustScoreBadge score={trustScore.overall} size="lg" />}
              <div className={`flex flex-col items-center rounded-xl px-5 py-3 ${ratingBgColor(entity.averageRating || 0)}`}>
                <span className={`text-3xl font-bold ${ratingColor(entity.averageRating || 0)}`}>
                  {entity.averageRating?.toFixed(1) || 'N/A'}
                </span>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(entity.averageRating || 0) ? 'fill-star text-star' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted mt-0.5">{entity.reviewCount} reviews</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{entity.categoryKey}</Badge>
            {entity.warningTags?.map((tag: string) => (
              <Badge key={tag} variant="warning">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>

          {entity.description && (
            <p className="mt-4 text-muted leading-relaxed">{entity.description}</p>
          )}

          {/* Entity Badges */}
          {entityBadges && entityBadges.length > 0 && (
            <div className="mt-4">
              <EntityBadgeDisplay badges={entityBadges} />
            </div>
          )}

          {/* Response Metrics */}
          {responseMetrics && (
            <div className="mt-4">
              <ResponseMetricsBar metrics={responseMetrics} />
            </div>
          )}

          {/* Trust Score Breakdown (collapsible) */}
          {trustScore && <TrustBreakdownToggle breakdown={trustScore} />}

          {/* Save / Bookmark */}
          {isAuthenticated && (
            <button
              onClick={() => {
                if (isSaved) {
                  unsaveEntity.mutate(id, {
                    onSuccess: () => toast.success('Removed from saved entities'),
                    onError: () => toast.error('Failed to update saved entities'),
                  });
                } else {
                  saveEntity.mutate(id, {
                    onSuccess: () => toast.success('Entity saved!'),
                    onError: () => toast.error('Failed to save entity'),
                  });
                }
              }}
              disabled={saveEntity.isPending || unsaveEntity.isPending}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-50"
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {isSaved ? 'Saved' : 'Save Entity'}
            </button>
          )}

          {/* Follow Button */}
          <FollowButton entityId={id} entityName={entity?.name} />

          {/* Claim Ownership */}
          {isAuthenticated && !showClaimForm && !hasApprovedClaim && (
            hasPendingClaim ? (
              <Link href="/dashboard/claims" className="mt-4 ml-4 inline-block text-sm font-medium text-primary hover:underline">
                View Claim Status
              </Link>
            ) : (
              <button
                onClick={() => setShowClaimForm(true)}
                className="mt-4 ml-4 text-sm font-medium text-primary hover:underline"
              >
                Claim Ownership
              </button>
            )
          )}

          {hasApprovedClaim && (
            <div className="mt-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                    <ShieldAlert className="h-4 w-4" /> You own this business profile
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700">Manage replies, view analytics, and invite customers to review.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/entities/${id}/owner-dashboard`}>
                  <Button size="sm">Open Owner Dashboard</Button>
                </Link>
                <Link href={`/entities/${id}/owner-dashboard`}>
                  <Button size="sm" variant="outline" className="text-emerald-800 border-emerald-300 hover:bg-emerald-200">Reply to Reviews</Button>
                </Link>
                <Link href={`/entities/${id}/owner-dashboard`}>
                  <Button size="sm" variant="outline" className="text-emerald-800 border-emerald-300 hover:bg-emerald-200">View Analytics</Button>
                </Link>
              </div>
            </div>
          )}

          {showClaimForm && !hasApprovedClaim && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary-light p-4">
              <h3 className="text-sm font-semibold text-primary-dark">Claim This Entity</h3>
              <p className="mt-1 text-xs text-primary-dark/70">
                Submit a claim to manage this listing. Our team will verify your ownership.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  loading={claimMutation.isPending}
                  onClick={() =>
                    claimMutation.mutate(
                      { verificationMethod: 'phone_otp' },
                      {
                        onSuccess: () => {
                          toast.success('Claim submitted! We will review it shortly.');
                          setShowClaimForm(false);
                        },
                        onError: (error) => {
                          toast.error(resolveClaimSubmitError(error));
                          if ((error as AxiosError)?.response?.status === 409) {
                            setShowClaimForm(false);
                          }
                        },
                      },
                    )
                  }
                >
                  Submit Claim
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowClaimForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Category-Specific Profile */}
        {categoryProfile && (
          <div className="mb-8">
            <CategoryProfileCard profile={categoryProfile} />
          </div>
        )}

        {/* Write Review CTA */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-border/80 bg-white p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Reviews</h2>
            <p className="text-sm text-muted">Share your experience to help others</p>
          </div>
          {isAuthenticated ? (
            <Link href={`/entities/${id}/review`}>
              <Button size="lg">Write a Review</Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Login to Review</Button>
            </Link>
          )}
        </div>

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewSkeleton key={i} />
            ))}
          </div>
        ) : !reviews?.data?.length ? (
          <EmptyState
            title="No reviews yet"
            description="Be the first to share your experience."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Review Filters
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="relative sm:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <input
                    value={reviewQuery}
                    onChange={(e) => setReviewQuery(e.target.value)}
                    placeholder="Search in reviews"
                    className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <select
                  value={reviewSort}
                  onChange={(e) => {
                    setReviewSort(e.target.value as 'newest' | 'highest' | 'lowest' | 'helpful');
                    setReviewPage(1);
                  }}
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                  <option value="helpful">Most helpful</option>
                </select>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[null, 4, 3, 2].map((value) => (
                  <button
                    key={String(value)}
                    onClick={() => setMinReviewRating(value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      minReviewRating === value
                        ? 'bg-primary text-white'
                        : 'bg-surface text-muted hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {value == null ? 'Any rating' : `${value}+ stars`}
                  </button>
                ))}
                <span className="ml-auto text-xs text-muted">
                  Showing {filteredReviews.length} of {reviews.data.length}
                </span>
              </div>
            </div>

            {filteredReviews.filter((review): review is Review => Boolean(review?.id)).map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                canReplyAsOwner={Boolean(isAuthenticated && hasApprovedClaim)}
              />
            ))}

            {filteredReviews.length === 0 && (
              <EmptyState
                title="No reviews matched"
                description="Try changing the search text or rating filter."
              />
            )}

            {reviews.meta.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reviewPage <= 1}
                  onClick={() => setReviewPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted">
                  Page {reviewPage} of {reviews.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reviewPage >= reviews.meta.totalPages}
                  onClick={() => setReviewPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </PublicLayout>
  );
}

function TrustBreakdownToggle({ breakdown }: { breakdown: { overall: number; baseRating: number; volumeConfidence: number; consistency: number; recency: number; responsiveness: number; warningPenalty: number; suspiciousPenalty: number; moderationPenalty: number } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {open ? 'Hide' : 'View'} Trust Score Breakdown
      </button>
      {open && (
        <div className="mt-3 rounded-lg border border-border bg-surface p-4">
          <TrustScoreBreakdown breakdown={breakdown} />
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, canReplyAsOwner }: { review: Review; canReplyAsOwner: boolean }) {
  const { isAuthenticated, user } = useAuth();
  const voteMutation = useVote(review.id);
  const reportMutation = useReportReview(review.id);
  const replyMutation = useCreateReply(review.id);
  const commentsQuery = useReviewComments(review.id, { page: 1, pageSize: 5 });
  const addCommentMutation = useAddReviewComment(review.id);
  const deleteMutation = useDeleteReview(review.id);
  const updateMutation = useUpdateReview(review.id);
  const toast = useToast();
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(review.body);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [liveComments, setLiveComments] = useState<ReviewComment[]>(review.comments ?? []);
  const [liveCommentCount, setLiveCommentCount] = useState(Number(review.commentCount ?? review.comments?.length ?? 0));

  const isAuthor = user?.id && review.authorId === user.id;
  const canReply = Boolean(isAuthenticated && canReplyAsOwner);

  useReviewInteractionSocket(review.id, {
    onNewComment: (payload) => {
      const incoming = payload.comment as ReviewComment;
      setLiveComments((prev) => {
        if (prev.some((c) => c.id === incoming.id)) return prev;
        return [incoming, ...prev].slice(0, 10);
      });
      setLiveCommentCount(payload.totalComments);
    },
    onCommentReaction: (payload) => {
      setLiveComments((prev) =>
        prev.map((comment) =>
          comment.id === payload.commentId
            ? { ...comment, likeCount: payload.likeCount, dislikeCount: payload.dislikeCount }
            : comment,
        ),
      );
    },
  });

  const handleSaveEdit = () => {
    updateMutation.mutate(
      { body: editBody },
      {
        onSuccess: () => { setEditing(false); toast.success('Review updated'); },
        onError: () => toast.error('Failed to update review'),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => toast.success('Review deleted'),
      onError: () => toast.error('Failed to delete review'),
    });
  };

  const handleAddComment = () => {
    const body = commentBody.trim();
    if (!body || !isAuthenticated) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: ReviewComment = {
      id: tempId,
      body,
      isAnonymous: commentAnonymous,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: new Date().toISOString(),
      author: { id: user?.id ?? null, displayName: commentAnonymous ? 'Anonymous' : (user?.displayName ?? 'You') },
    };

    setLiveComments((prev) => [optimisticComment, ...prev].slice(0, 10));
    setLiveCommentCount((prev) => prev + 1);
    setCommentBody('');
    setCommentAnonymous(false);
    setShowComments(true);

    addCommentMutation.mutate(
      { body, isAnonymous: commentAnonymous },
      {
        onError: () => {
          setLiveComments((prev) => prev.filter((comment) => comment.id !== tempId));
          setLiveCommentCount((prev) => Math.max(0, prev - 1));
          toast.error('Could not add comment');
        },
      },
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <StarRating value={review.rating} readonly size="sm" />
              <span className="text-sm font-bold text-foreground">
                {review.title || 'Review'}
              </span>
              {review.status === 'under_verification' && (
                <Badge variant="warning">
                  <ShieldAlert className="mr-1 h-3 w-3" /> Under Verification
                </Badge>
              )}
              {review.status === 'hidden' && (
                <Badge variant="danger">Hidden</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              Anonymous Reviewer &middot; {formatRelativeTime(review.createdAt)}
            </p>
          </div>
          {/* Author actions */}
          {isAuthor && !editing && (
            <div className="flex gap-1">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary"
                title="Edit review"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                title="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Edit mode */}
        {editing ? (
          <div className="mt-3">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              maxLength={FIELD_LIMITS.REVIEW_BODY}
              rows={4}
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" loading={updateMutation.isPending} onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditBody(review.body); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{review.body}</p>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">Permanently delete this review?</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="danger" loading={deleteMutation.isPending} onClick={handleDelete}>
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {review.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {review.tags.map((tag: string) => (
              <Badge key={tag} variant="info">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Vote / Report bar */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
          <CommunityValidation reviewId={review.id} />
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark"
          >
            <MessageSquare className="h-4 w-4" />
            {showComments ? 'Hide Comments' : `Comments (${liveCommentCount})`}
          </button>
          {canReply && (
            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark"
            >
              <MessageSquare className="h-4 w-4" />
              {showReplyForm ? 'Cancel Reply' : 'Reply as Owner'}
            </button>
          )}
          <div className="flex-1" />
          <button
            disabled={!isAuthenticated || voteMutation.isPending}
            onClick={() => voteMutation.mutate('helpful')}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary disabled:opacity-50 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful ({review.helpfulCount || 0})
          </button>
          <button
            disabled={!isAuthenticated || voteMutation.isPending}
            onClick={() => voteMutation.mutate('not_helpful')}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-trust-bad disabled:opacity-50 transition-colors"
          >
            <ThumbsDown className="h-4 w-4" />
            {review.unhelpfulCount || 0}
          </button>
          <button
            disabled={!isAuthenticated}
            onClick={() => setShowReportConfirm(true)}
            className="ml-auto flex items-center gap-1.5 text-sm text-muted hover:text-trust-bad disabled:opacity-50 transition-colors"
          >
            <Flag className="h-4 w-4" />
            Report
          </button>
        </div>

        {showReplyForm && canReply && (
          <div className="mt-3 rounded-md border border-primary/20 bg-primary-light/40 p-3">
            <p className="text-xs font-medium text-primary-dark">Post a public owner response</p>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              maxLength={FIELD_LIMITS.REPLY_BODY}
              rows={3}
              className="mt-2 w-full rounded-md border border-border bg-white p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Write your response..."
            />
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                loading={replyMutation.isPending}
                disabled={!replyBody.trim()}
                onClick={() =>
                  (() => {
                    const reply = replyBody.trim();
                    if (!canReply) {
                      toast.error('Only approved claim owner can reply');
                      return;
                    }
                    if (reply.length < 2 || reply.length > 2000) {
                      toast.error('Reply must be between 2 and 2000 characters');
                      return;
                    }
                    replyMutation.mutate(reply, {
                      onSuccess: () => {
                        toast.success('Reply posted');
                        setReplyBody('');
                        setShowReplyForm(false);
                      },
                      onError: () => toast.error('Could not post reply'),
                    });
                  })()
                }
              >
                Post Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showComments && (
          <div className="mt-3 rounded-md border border-border bg-surface/50 p-3">
            {isAuthenticated ? (
              <div className="rounded-md border border-border bg-white p-3">
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={2}
                  maxLength={FIELD_LIMITS.COMMENT_BODY}
                  className="w-full resize-none rounded-md border border-border p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Add a comment..."
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={commentAnonymous}
                      onChange={(e) => setCommentAnonymous(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border"
                    />
                    Comment anonymously
                  </label>
                  <Button size="sm" onClick={handleAddComment} loading={addCommentMutation.isPending} disabled={!commentBody.trim()}>
                    <SendHorizontal className="mr-1 h-3.5 w-3.5" /> Post
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">Login to comment on this review.</p>
            )}

            <div className="mt-3 space-y-2">
              {liveComments.length === 0 ? (
                <p className="text-xs text-muted">No comments yet.</p>
              ) : (
                liveComments.map((comment) => (
                  <EntityReviewCommentItem
                    key={comment.id}
                    reviewId={review.id}
                    comment={comment}
                    onOptimisticReaction={(type) => {
                      setLiveComments((prev) =>
                        prev.map((row) =>
                          row.id === comment.id
                            ? {
                                ...row,
                                likeCount: row.likeCount + (type === 'like' ? 1 : 0),
                                dislikeCount: row.dislikeCount + (type === 'dislike' ? 1 : 0),
                              }
                            : row,
                        ),
                      );
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {showReportConfirm && (
          <div className="mt-3 rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">Are you sure you want to report this review?</p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="danger"
                loading={reportMutation.isPending}
                onClick={() => {
                  reportMutation.mutate(
                    { reportType: 'other' },
                    { onSuccess: () => setShowReportConfirm(false) },
                  );
                }}
              >
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReportConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {review.replies?.length > 0 && (
          <div className="mt-4 space-y-3 rounded-lg border-l-4 border-primary/30 bg-surface pl-4 py-3 pr-3">
            {review.replies.map((reply) => (
              <div key={reply.id}>
                <p className="text-xs font-semibold text-foreground">
                  {reply.authorName || 'Owner Response'}{' '}
                  <span className="font-normal text-muted">
                    &middot; {formatRelativeTime(reply.createdAt)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-foreground/80">{reply.body}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EntityReviewCommentItem(
  {
    reviewId,
    comment,
    onOptimisticReaction,
  }: {
    reviewId: string;
    comment: ReviewComment;
    onOptimisticReaction: (type: 'like' | 'dislike') => void;
  },
) {
  const { isAuthenticated } = useAuth();
  const reactMutation = useReactReviewComment(reviewId, comment.id);
  const [isReacting, setIsReacting] = useState(false);

  return (
    <div className="rounded-md border border-border bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{comment.author.displayName}</p>
        <p className="text-[10px] text-muted">{formatRelativeTime(comment.createdAt)}</p>
      </div>
      <p className="mt-1 text-sm text-foreground/85 whitespace-pre-line">{comment.body}</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={async () => {
            if (!isAuthenticated || reactMutation.isPending || isReacting) return;
            setIsReacting(true);
            onOptimisticReaction('like');
            try {
              await reactMutation.mutateAsync('like');
            } finally {
              setIsReacting(false);
            }
          }}
          disabled={!isAuthenticated || reactMutation.isPending || isReacting}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-primary disabled:opacity-50"
        >
          <ThumbsUp className="h-3 w-3" /> {comment.likeCount}
        </button>
        <button
          onClick={async () => {
            if (!isAuthenticated || reactMutation.isPending || isReacting) return;
            setIsReacting(true);
            onOptimisticReaction('dislike');
            try {
              await reactMutation.mutateAsync('dislike');
            } finally {
              setIsReacting(false);
            }
          }}
          disabled={!isAuthenticated || reactMutation.isPending || isReacting}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-trust-bad disabled:opacity-50"
        >
          <ThumbsDown className="h-3 w-3" /> {comment.dislikeCount}
        </button>
      </div>
    </div>
  );
}
