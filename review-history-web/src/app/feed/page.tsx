'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Bookmark,
  TrendingUp,
  Flame,
  PenSquare,
  Search,
  Sparkles,
  Award,
  Flag,
  BookOpen,
  MessagesSquare,
  Filter,
  Heart,
  Clock,
  X,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Badge, CardSkeleton, EmptyState, Button } from '@/components/ui';
import { StarRating } from '@/components/ui/star-rating';
import { TrustScoreBadge } from '@/components/shared/trust-score';
import { CategoryIcon } from '@/components/shared/category-icon';
import { useInfiniteFeedReviews, useCategories, useVote, useReportReview, useBlogs, useDiscussions } from '@/hooks/use-api';
import { useFeedSocket } from '@/hooks/use-socket';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime, ratingBgColor, cn, truncate, getInitials } from '@/lib/utils';
import type { FeedReview } from '@/types';

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('');
  const [newReviewsCount, setNewReviewsCount] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null); // 5, 4, 3, 2, 1
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'trending'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sort menu on outside click
  useEffect(() => {
    if (!showSortMenu) return;
    const handler = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSortMenu]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteFeedReviews({
    pageSize: 10,
    ...(activeCategory && { category: activeCategory }),
    sort: sortBy,
    ...(ratingFilter ? { rating: ratingFilter } : {}),
  });
  const { data: categories } = useCategories();
  const { data: blogsData } = useBlogs({ page: 1, pageSize: 3 });
  const { data: discussionsData } = useDiscussions({ page: 1, pageSize: 3 });

  // Real-time feed socket — shows "new reviews" banner
  useFeedSocket(() => {
    setNewReviewsCount((n) => n + 1);
  });

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

  const clearAllFilters = () => {
    setActiveCategory('');
    setRatingFilter(null);
    setSortBy('recent');
  };

  // Flatten pages into a single list
  const reviews = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.meta?.total ?? 0;

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-surface min-h-screen">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-20" />
        <div className="blob-orange absolute bottom-40 -left-10 h-48 w-48 opacity-15" />
        <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
                <Rss className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
                <p className="text-sm text-muted">Latest reviews from the community</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/search')}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-muted ring-1 ring-border transition-all hover:bg-surface hover:text-foreground hover:shadow-sm"
                title="Search entities"
              >
                <Search className="h-4 w-4" />
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => router.push('/entities/add')}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-lg"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  Add
                </button>
              )}
            </div>
          </div>

          {/* Filter & Sort Bar */}
          <div className="mb-5 rounded-2xl border border-border bg-white/95 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                  showFilters
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface text-foreground hover:bg-primary/10',
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {(ratingFilter || activeCategory) && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[11px] font-semibold">
                    {(ratingFilter ? 1 : 0) + (activeCategory ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface/80"
                >
                  <Clock className="h-4 w-4" />
                  {sortBy === 'recent' ? 'Recent first' : sortBy === 'helpful' ? 'Most helpful' : 'Trending now'}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showSortMenu && 'rotate-180')} />
                </button>

                {showSortMenu && (
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                    {([
                      { value: 'recent', label: 'Recent first', icon: '🕐' },
                      { value: 'helpful', label: 'Most helpful', icon: '👍' },
                      { value: 'trending', label: 'Trending now', icon: '🔥' },
                    ] as const).map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          setSortBy(item.value);
                          setShowSortMenu(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                          sortBy === item.value
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-surface',
                        )}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(ratingFilter || activeCategory || sortBy !== 'recent') && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border/70 pt-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-all ring-1',
                      ratingFilter === rating
                        ? 'bg-amber-100 text-amber-800 ring-amber-300'
                        : 'bg-white text-muted ring-border hover:bg-amber-50',
                    )}
                  >
                    {'★'.repeat(rating)}
                    {rating < 5 ? ' & up' : ''}
                  </button>
                ))}
              </div>
            )}
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
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  All
                </span>
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

          {/* Engagement Strip */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => router.push('/discussions')}
              className="rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <MessagesSquare className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">Join Discussions</p>
              </div>
              <p className="mt-2 text-xs text-muted">Share stories, ask questions, and help community members.</p>
            </button>

            <button
              onClick={() => router.push('/blogs')}
              className="rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">Read Blogs</p>
              </div>
              <p className="mt-2 text-xs text-muted">Practical guides and tips to make better decisions.</p>
            </button>
          </div>

          {/* Community Snapshot */}
          {(discussionsData?.data?.length || blogsData?.data?.length) && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Latest Discussions</p>
                  <Link href="/discussions" className="text-xs font-medium text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {discussionsData?.data?.slice(0, 3).map((d) => (
                    <Link key={d.id} href="/discussions" className="block rounded-lg bg-surface px-2.5 py-2 hover:bg-primary-light">
                      <p className="line-clamp-1 text-xs font-medium text-foreground">{d.title || 'Untitled discussion'}</p>
                      <p className="text-[11px] text-muted">{d.commentCount} comments · {d.likeCount} likes</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Latest Blogs</p>
                  <Link href="/blogs" className="text-xs font-medium text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {blogsData?.data?.slice(0, 3).map((b) => (
                    <Link key={b.id} href={`/blogs/${b.slug}`} className="block rounded-lg bg-surface px-2.5 py-2 hover:bg-primary-light">
                      <p className="line-clamp-1 text-xs font-medium text-foreground">{b.title}</p>
                      <p className="line-clamp-1 text-[11px] text-muted">{b.excerpt || 'Read this article'}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feed Content */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => <FeedCardSkeleton key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary-light to-primary/10">
                <PenSquare className="h-9 w-9 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {ratingFilter || activeCategory ? 'No matching reviews found' : 'No reviews yet'}
                </h3>
                <p className="mt-1 text-sm text-muted max-w-xs mx-auto">
                  {ratingFilter || activeCategory
                    ? 'Try changing filters or category to explore more results.'
                    : 'Be the first to share your experience! Reviews will appear here as the community grows.'}
                </p>
              </div>
              {isAuthenticated && !ratingFilter && !activeCategory && (
                <Button onClick={() => router.push('/entities/add')} className="mt-2 gap-2">
                  <PenSquare className="h-4 w-4" />
                  Add an Entity
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* New reviews banner (socket) */}
              {newReviewsCount > 0 && (
                <button
                  onClick={() => { setNewReviewsCount(0); refetch(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark"
                >
                  <Rss className="h-4 w-4 animate-pulse" />
                  {newReviewsCount} new {newReviewsCount === 1 ? 'review' : 'reviews'} — tap to refresh
                </button>
              )}

              {/* Review count + stats bar */}
              {totalCount > 0 && (
                <div className="mb-5 flex items-center justify-between rounded-xl bg-white/80 px-4 py-2.5 ring-1 ring-border/50 backdrop-blur-sm">
                  <p className="text-xs text-muted">
                    <span className="font-semibold text-foreground">{totalCount}</span> reviews
                    {activeCategory && (
                      <span> in <span className="font-medium text-primary">{categories?.find(c => c.key === activeCategory)?.name}</span></span>
                    )}
                    {ratingFilter && (
                      <span> rated <span className="font-medium text-primary">{ratingFilter}★ & up</span></span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span>Live</span>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {reviews.map((review, index) => (
                  <FeedCard key={review.id} review={review} index={index} />
                ))}
              </div>

              {/* Engagement prompt between reviews */}
              {isAuthenticated && reviews.length >= 5 && (
                <div className="my-6 rounded-2xl bg-linear-to-r from-primary/5 via-primary-light/50 to-primary/5 p-5 text-center ring-1 ring-primary/10">
                  <p className="text-sm font-medium text-foreground">Had an experience worth sharing?</p>
                  <p className="mt-0.5 text-xs text-muted">Your reviews help others make informed decisions</p>
                  <Button
                    size="sm"
                    onClick={() => router.push('/search')}
                    className="mt-3 gap-1.5"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
                    Write a Review
                  </Button>
                </div>
              )}

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

function FeedCard({ review, index }: { review: FeedReview; index: number }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [animateHelpful, setAnimateHelpful] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const voteMutation = useVote(review.id);
  const reportMutation = useReportReview(review.id);
  const reportRef = useRef<HTMLDivElement>(null);

  const entityUrl = `/entities/${review.entity.id}`;

    // Close report confirm on outside click
    useEffect(() => {
      if (!showReportConfirm) return;
      const handler = (e: MouseEvent) => {
        if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
          setShowReportConfirm(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [showReportConfirm]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${entityUrl}`
    : entityUrl;

  const bodyIsLong = review.body.length > 280;
  const displayBody = bodyIsLong && !expanded ? truncate(review.body, 280) : review.body;
  const parsedAverageRating = Number(review.entity.averageRating);
  const entityAverageRating = Number.isFinite(parsedAverageRating) ? parsedAverageRating : 0;

  // Trending indicator: high helpful count or recent with lots of engagement
  const isTrending = review.helpfulCount >= 5 || (review.helpfulCount + review.replies.length) >= 8;

  const handleShare = async () => {
    const shareData = {
      title: `Review: ${review.entity.name}`,
      text: `${review.entity.name} rated ${review.overallRating}/5: "${truncate(review.body, 100)}"`,
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
    if (voteType === 'helpful') {
      setAnimateHelpful(true);
      setTimeout(() => setAnimateHelpful(false), 600);
      
      // Floating hearts animation
      const newHearts = Array.from({ length: 3 }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        x: Math.random() * 60 - 30,
        y: Math.random() * 40 - 20,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => setHearts((prev) => prev.slice(3)), 1000);
    }
    voteMutation.mutate(voteType);
  };

  const handleReport = () => {
    reportMutation.mutate(
      { reportType: 'inappropriate' },
      { onSuccess: () => setShowReportConfirm(false) },
    );
  };

  // Rating sentiment
  const ratingLabel =
    review.overallRating >= 4 ? 'Positive' :
    review.overallRating >= 3 ? 'Mixed' : 'Critical';
  const ratingLabelColor =
    review.overallRating >= 4 ? 'text-primary bg-primary-light' :
    review.overallRating >= 3 ? 'text-amber-700 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      {/* Trending Banner */}
      {isTrending && (
        <div className="flex items-center gap-1.5 bg-linear-to-r from-amber-50 to-orange-50 px-5 py-1.5 text-xs font-medium text-amber-700">
          <Flame className="h-3 w-3 text-orange-500" />
          Trending Review
        </div>
      )}

      {/* Card Header — Entity Info */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        {/* Entity Avatar */}
        <Link href={entityUrl} className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary-light to-primary/10 ring-2 ring-primary/10 transition-transform group-hover:scale-105">
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
          <Link href={entityUrl} className="group/link">
            <h3 className="text-sm font-semibold text-foreground group-hover/link:text-primary transition-colors truncate">
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

        {/* Entity Score + Trust */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold shadow-sm', ratingBgColor(entityAverageRating))}>
            {entityAverageRating.toFixed(1)}
          </div>
          <span className="text-[10px] text-muted">{review.entity.reviewCount} reviews</span>
        </div>
      </div>

      {/* Review Author + Rating Bar */}
      <div className="flex items-center gap-2.5 border-t border-border/40 bg-surface/40 px-5 py-2.5">
        {/* Author Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-navy/10 to-navy/5 text-xs font-semibold text-navy">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {review.author?.displayName || 'Anonymous Reviewer'}
          </span>
          {review.author?.trustLevel === 'trusted' && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary-dark">
              <Award className="h-2.5 w-2.5" />
              Trusted
            </span>
          )}
        </div>
        <StarRating value={review.overallRating} readonly size="sm" />
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', ratingLabelColor)}>
          {ratingLabel}
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
            className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Read more <ChevronDown className="h-3 w-3" /></>
            )}
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
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
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

      {/* Engagement Stats */}
      {(review.helpfulCount > 0 || review.replies.length > 0) && (
        <div className="flex items-center gap-3 px-5 pb-2 text-[11px] text-muted">
          {review.helpfulCount > 0 && (
            <span>{review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful</span>
          )}
          {review.helpfulCount > 0 && review.replies.length > 0 && <span className="text-border">·</span>}
          {review.replies.length > 0 && (
            <span>{review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}</span>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-border/50 px-3 py-1.5">
        <div className="flex items-center gap-0.5 relative">
          {/* Helpful button with floating hearts */}
              <div className="relative">
            <button
              onClick={() => handleVote('helpful')}
              disabled={!isAuthenticated || voteMutation.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
                isAuthenticated
                  ? 'text-muted hover:bg-primary-light hover:text-primary active:scale-95'
                  : 'text-muted/50 cursor-not-allowed',
                animateHelpful && 'bg-primary-light text-primary scale-105',
              )}
            >
              <ThumbsUp className={cn('h-4 w-4 transition-transform', animateHelpful && 'animate-bounce')} />
              <span>Helpful</span>
              {review.helpfulCount > 0 && <span className="text-[10px] opacity-60">{review.helpfulCount}</span>}
            </button>
            
            {/* Floating hearts animation */}
            {hearts.map((heart) => (
              <div
                key={heart.id}
                className="pointer-events-none absolute bottom-0 left-1/2 animate-ping-up"
                style={{
                  transform: `translate(calc(-50% + ${heart.x}px), -100%)`,
                  opacity: 1,
                }}
              >
                <Heart className="h-4 w-4 text-primary fill-primary" />
              </div>
            ))}
          </div>

          {/* Not Helpful */}
          <button
            onClick={() => handleVote('not_helpful')}
            disabled={!isAuthenticated || voteMutation.isPending}
            className={cn(
              'inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium transition-all',
              isAuthenticated
                ? 'text-muted hover:bg-accent-light hover:text-accent-dark active:scale-95'
                : 'text-muted/50 cursor-not-allowed',
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Center: replies toggle */}
        {review.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
              showReplies
                ? 'bg-surface text-foreground'
                : 'text-muted hover:bg-surface hover:text-foreground',
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {review.replies.length}
            {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}

        <div className="flex items-center gap-0.5">
          {/* Bookmark */}
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={cn(
              'inline-flex items-center rounded-xl p-2 text-xs transition-all active:scale-90',
              bookmarked
                ? 'text-primary bg-primary-light'
                : 'text-muted hover:bg-surface hover:text-foreground',
            )}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-primary')} />
          </button>
          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium text-muted transition-all hover:bg-primary-light hover:text-primary active:scale-95"
          >
            {shareSuccess ? <Check className="h-3.5 w-3.5 text-primary" /> : <Share2 className="h-3.5 w-3.5" />}
            {shareSuccess ? 'Copied!' : 'Share'}
          </button>
          {/* Report (for authenticated users) */}
          {isAuthenticated && (
            <div className="relative" ref={reportRef}>
              <button
                onClick={() => setShowReportConfirm(!showReportConfirm)}
                className="inline-flex items-center rounded-xl p-2 text-xs text-muted/40 transition-all hover:text-red-400 hover:bg-red-50"
                title="Report review"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
              {showReportConfirm && (
                <div className="absolute right-0 bottom-full mb-1 z-10 rounded-xl bg-white p-3 shadow-lg ring-1 ring-border w-48">
                  <p className="text-xs text-muted mb-2">Report this review as inappropriate?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReport}
                      disabled={reportMutation.isPending}
                      className="flex-1 rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => setShowReportConfirm(false)}
                      className="flex-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* View entity */}
          <Link
            href={entityUrl}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium text-muted transition-all hover:bg-surface hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
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

      {/* Timestamp footer */}
      <div className="border-t border-border/30 px-5 py-2">
        <span className="text-[10px] text-muted">
          {review.publishedAt ? formatRelativeTime(review.publishedAt) : formatRelativeTime(review.createdAt)}
        </span>
      </div>
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
