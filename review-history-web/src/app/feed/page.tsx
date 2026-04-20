'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MapPin,
  Star,
  User,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Rss,
  Loader2,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Badge, CardSkeleton, EmptyState, Button } from '@/components/ui';
import { StarRating } from '@/components/ui/star-rating';
import { TrustScoreBadge } from '@/components/shared/trust-score';
import { CategoryIcon } from '@/components/shared/category-icon';
import { useInfiniteFeedReviews, useCategories, useVote, useReportReview } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime, ratingBgColor, cn, truncate, getInitials } from '@/lib/utils';
import type { FeedReview } from '@/types';

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState('');
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteFeedReviews({
    pageSize: 10,
    ...(activeCategory && { category: activeCategory }),
  });
  const { data: categories } = useCategories();

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: '400px',
    });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  // Flatten pages into a single list
  const reviews = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.meta?.total ?? 0;

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-surface min-h-screen">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-20" />
        <div className="blob-orange absolute bottom-40 -left-10 h-48 w-48 opacity-15" />
        <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {/* Feed Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
              <Rss className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
              <p className="text-sm text-muted">Latest reviews from the community</p>
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories && categories.length > 0 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => { setActiveCategory(''); }}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  !activeCategory
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white text-muted ring-1 ring-border hover:bg-surface hover:text-foreground',
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); }}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
                    activeCategory === cat.key
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white text-muted ring-1 ring-border hover:bg-surface hover:text-foreground',
                  )}
                >
                  <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Feed Content */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => <FeedCardSkeleton key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Be the first to share your experience! Reviews will appear here as the community grows."
            />
          ) : (
            <>
              {/* Review count */}
              {totalCount > 0 && (
                <p className="mb-4 text-xs text-muted">
                  Showing {reviews.length} of {totalCount} reviews
                </p>
              )}

              <div className="space-y-6">
                {reviews.map((review) => (
                  <FeedCard key={review.id} review={review} />
                ))}
              </div>

              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted">Loading more reviews...</span>
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />

              {/* End of feed */}
              {!hasNextPage && reviews.length > 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">You&apos;re all caught up!</p>
                  <p className="text-xs text-muted">You&apos;ve seen all {totalCount} reviews</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

/* ─── Feed Card (Instagram-style) ─── */
function FeedCard({ review }: { review: FeedReview }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const voteMutation = useVote(review.id);
  const reportMutation = useReportReview(review.id);

  const entityUrl = `/entities/${review.entity.id}`;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${entityUrl}`
    : entityUrl;

  const bodyIsLong = review.body.length > 280;
  const displayBody = bodyIsLong && !expanded ? truncate(review.body, 280) : review.body;
  const parsedAverageRating = Number(review.entity.averageRating);
  const entityAverageRating = Number.isFinite(parsedAverageRating) ? parsedAverageRating : 0;

  const handleShare = async () => {
    const shareData = {
      title: `Review: ${review.entity.name}`,
      text: `Anonymous reviewer rated ${review.entity.name} ${review.overallRating}/5: "${truncate(review.body, 100)}"`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleVote = (voteType: string) => {
    if (!isAuthenticated) return;
    voteMutation.mutate(voteType);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Card Header — Entity Info */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        {/* Entity Avatar */}
        <Link href={entityUrl} className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary/10 ring-2 ring-primary/10">
            {review.entity.categoryIcon ? (
              <CategoryIcon name={review.entity.categoryIcon} className="h-6 w-6 text-primary-dark" />
            ) : (
              <span className="text-sm font-bold text-primary-dark">
                {getInitials(review.entity.name)}
              </span>
            )}
          </div>
        </Link>

        {/* Entity Name + Meta */}
        <div className="flex-1 min-w-0">
          <Link href={entityUrl} className="group">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {review.entity.name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {review.entity.city}
            </span>
            <span className="text-border">·</span>
            <span>{review.entity.categoryName}</span>
          </div>
        </div>

        {/* Entity Score Mini */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold', ratingBgColor(entityAverageRating))}>
            {entityAverageRating.toFixed(1)}
          </div>
          <span className="text-[10px] text-muted">{review.entity.reviewCount} reviews</span>
        </div>
      </div>

      {/* Review Author + Rating Bar */}
      <div className="flex items-center gap-2.5 border-t border-border/40 bg-surface/40 px-5 py-2.5">
        {/* Author Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-navy/10 to-navy/5 text-xs font-semibold text-navy">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground">Anonymous Reviewer</span>
        </div>
        <StarRating value={review.overallRating} readonly size="sm" />
        <span className="text-xs text-muted whitespace-nowrap">
          {review.publishedAt ? formatRelativeTime(review.publishedAt) : formatRelativeTime(review.createdAt)}
        </span>
      </div>

      {/* Review Body */}
      <div className="px-5 py-4">
        {review.title && (
          <h4 className="mb-1.5 text-sm font-semibold text-foreground">{review.title}</h4>
        )}
        <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
          {displayBody}
        </p>
        {bodyIsLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-3">
          {review.tags.map((tag) => (
            <span
              key={tag.key}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                tag.isPositive
                  ? 'bg-primary-light text-primary-dark'
                  : 'bg-accent-light text-accent-dark',
              )}
            >
              {!tag.isPositive && <AlertTriangle className="h-2.5 w-2.5" />}
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-border/50 px-5 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote('helpful')}
            disabled={!isAuthenticated || voteMutation.isPending}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              isAuthenticated
                ? 'text-muted hover:bg-primary-light hover:text-primary'
                : 'text-muted/50 cursor-not-allowed',
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {review.helpfulCount > 0 && review.helpfulCount}
          </button>
          <button
            onClick={() => handleVote('not_helpful')}
            disabled={!isAuthenticated || voteMutation.isPending}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              isAuthenticated
                ? 'text-muted hover:bg-accent-light hover:text-accent-dark'
                : 'text-muted/50 cursor-not-allowed',
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            {review.unhelpfulCount > 0 && review.unhelpfulCount}
          </button>
        </div>

        {/* Replies toggle */}
        {review.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
            {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-primary-light hover:text-primary"
          >
            {shareSuccess ? <Check className="h-3.5 w-3.5 text-primary" /> : <Share2 className="h-3.5 w-3.5" />}
            {shareSuccess ? 'Copied!' : 'Share'}
          </button>
          <Link
            href={entityUrl}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </Link>
        </div>
      </div>

      {/* Replies Section */}
      {showReplies && review.replies.length > 0 && (
        <div className="border-t border-border/40 bg-surface/30 px-5 py-3 space-y-2.5">
          {review.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2.5">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/10 text-[10px] font-semibold text-navy">
                {reply.authorName ? getInitials(reply.authorName) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">{reply.authorName || 'User'}</span>
                  {reply.authorRole === 'claimed_owner' && (
                    <span className="rounded-full bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary-dark">Owner</span>
                  )}
                  <span className="text-[10px] text-muted">{formatRelativeTime(reply.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">{reply.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

/* ─── Skeleton ─── */
function FeedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="flex items-center gap-2 mb-4 py-2.5 border-t border-b border-border/40">
        <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mt-4 flex gap-4 border-t border-border/40 pt-3">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
