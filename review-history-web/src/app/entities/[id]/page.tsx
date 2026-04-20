'use client';

import { use } from 'react';
import { MapPin, Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, AlertTriangle, Pencil, Trash2, ChevronDown, ChevronUp, ShieldAlert, Bookmark, BookmarkCheck } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import {
  Card, CardContent, CardHeader, Badge, Button, StarRating,
  Skeleton, ReviewSkeleton, EmptyState,
} from '@/components/ui';
import { useEntity, useEntityReviews, useEntityTrustScore, useVote, useReportReview, useCreateClaim, useUpdateReview, useDeleteReview, useSavedEntities, useSaveEntity, useUnsaveEntity, useEntityBadges, useResponseMetrics, useCategoryProfile, useTrackPageView } from '@/hooks/use-api';
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
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function EntityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, user } = useAuth();
  const { data: entity, isLoading: entityLoading } = useEntity(id);
  const { data: trustScore } = useEntityTrustScore(id);
  const [reviewPage, setReviewPage] = useState(1);
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
  });
  const { data: entityBadges } = useEntityBadges(id);
  const { data: responseMetrics } = useResponseMetrics(id);
  const { data: categoryProfile } = useCategoryProfile(id);
  const trackPageView = useTrackPageView();

  useEffect(() => {
    trackPageView.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
          {isAuthenticated && !showClaimForm && (
            <button
              onClick={() => setShowClaimForm(true)}
              className="mt-4 ml-4 text-sm font-medium text-primary hover:underline"
            >
              Claim Ownership
            </button>
          )}

          {showClaimForm && (
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
                        onError: () => toast.error('Failed to submit claim.'),
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
            {reviews.data.map((review) => (
              <ReviewCard key={review.id} review={review} entityId={id} />
            ))}

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

function ReviewCard({ review, entityId }: { review: any; entityId: string }) {
  const { isAuthenticated, user } = useAuth();
  const voteMutation = useVote(review.id);
  const reportMutation = useReportReview(review.id);
  const deleteMutation = useDeleteReview(review.id);
  const updateMutation = useUpdateReview(review.id);
  const toast = useToast();
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(review.body);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = user?.id && review.authorId === user.id;

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
              maxLength={5000}
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
            {review.replies.map((reply: any) => (
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
