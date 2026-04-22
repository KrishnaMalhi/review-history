'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronUp, Loader2, MessageCircle, Share2, Star, ThumbsDown, ThumbsUp, User, Send } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Button, Card, CardContent, EmptyState, Skeleton } from '@/components/ui';
import { useAddReviewComment, useInfiniteFeedReviews, useTrackStreakActivity, useVote } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime } from '@/lib/utils';
import type { FeedReview, ReviewComment } from '@/types';
import { FIELD_LIMITS } from '@shared/field-limits';

function FeedCard({ review }: { review: FeedReview }) {
  const vote = useVote(review.id);
  const addComment = useAddReviewComment(review.id);
  const { isAuthenticated } = useAuth();
  const rating = Number(review.overallRating ?? 0);
  const entityUrl = `/entities/${review.entity.id}`;
  const [liveUserVote, setLiveUserVote] = useState<'helpful' | 'not_helpful' | null>(review.userVote ?? null);
  const [liveHelpful, setLiveHelpful] = useState(Number(review.helpfulCount ?? 0));
  const [liveNotHelpful, setLiveNotHelpful] = useState(Number(review.unhelpfulCount ?? 0));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [localComments, setLocalComments] = useState<ReviewComment[]>(review.comments ?? []);
  const [comment, setComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [liveCommentCount, setLiveCommentCount] = useState(Number(review.commentCount ?? review.comments?.length ?? 0));
  const [shareCopied, setShareCopied] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLiveUserVote(review.userVote ?? null);
    setLiveHelpful(Number(review.helpfulCount ?? 0));
    setLiveNotHelpful(Number(review.unhelpfulCount ?? 0));
    setLocalComments(review.comments ?? []);
    setLiveCommentCount(Number(review.commentCount ?? review.comments?.length ?? 0));
  }, [review.userVote, review.helpfulCount, review.unhelpfulCount, review.comments, review.commentCount]);

  const handleVote = (voteType: 'helpful' | 'not_helpful') => {
    if (!isAuthenticated || vote.isPending) return;

    const previousVote = liveUserVote;

    if (voteType === 'helpful') {
      if (previousVote === 'helpful') {
        setLiveUserVote(null);
        setLiveHelpful((v) => Math.max(0, v - 1));
      } else if (previousVote === 'not_helpful') {
        setLiveUserVote('helpful');
        setLiveHelpful((v) => v + 1);
        setLiveNotHelpful((v) => Math.max(0, v - 1));
      } else {
        setLiveUserVote('helpful');
        setLiveHelpful((v) => v + 1);
      }
    } else {
      if (previousVote === 'not_helpful') {
        setLiveUserVote(null);
        setLiveNotHelpful((v) => Math.max(0, v - 1));
      } else if (previousVote === 'helpful') {
        setLiveUserVote('not_helpful');
        setLiveNotHelpful((v) => v + 1);
        setLiveHelpful((v) => Math.max(0, v - 1));
      } else {
        setLiveUserVote('not_helpful');
        setLiveNotHelpful((v) => v + 1);
      }
    }

    vote.mutate(voteType, {
      onSuccess: (result: any) => {
        if (result?.action === 'removed') setLiveUserVote(null);
        if (result?.action === 'added' && (result?.voteType === 'helpful' || result?.voteType === 'not_helpful')) {
          setLiveUserVote(result.voteType);
        }
      },
      onError: () => {
        setLiveUserVote(previousVote);
        setLiveHelpful(Number(review.helpfulCount ?? 0));
        setLiveNotHelpful(Number(review.unhelpfulCount ?? 0));
      },
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${entityUrl}`;
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1400);
  };

  const handleOpenComments = () => {
    setCommentsOpen(true);
    window.setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleSendComment = async () => {
    const body = comment.trim();
    if (!body) return;
    const result = await addComment.mutateAsync({ body, isAnonymous: commentAnonymous }) as ReviewComment;
    setLocalComments((prev) => {
      if (prev.find((c) => c.id === result.id)) return prev;
      return [result, ...prev];
    });
    setLiveCommentCount((c) => c + 1);
    setComment('');
    setCommentAnonymous(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={entityUrl} className="text-base font-semibold text-foreground hover:text-primary">
              {review.entity.name}
            </Link>
            <p className="text-xs text-muted">{review.entity.city} • {review.entity.categoryName}</p>
          </div>
          <div className="rounded-lg bg-primary-light px-2.5 py-1 text-sm font-semibold text-primary">
            {Number.isFinite(rating) ? rating.toFixed(1) : '0.0'}
          </div>
        </div>

        {review.title && <h3 className="text-sm font-semibold text-foreground">{review.title}</h3>}
        <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{review.body}</p>

        <div className="flex flex-wrap gap-1.5">
          {review.tags.slice(0, 4).map((tag) => (
            <span key={tag.key} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
              {tag.label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted">
            {formatRelativeTime(review.createdAt)} • {review.author.displayName || 'Anonymous'}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={!isAuthenticated || vote.isPending}
              onClick={() => handleVote('helpful')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                liveUserVote === 'helpful' ? 'bg-primary-light text-primary' : 'text-muted hover:bg-surface'
              }`}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${liveUserVote === 'helpful' ? 'fill-primary' : ''}`} />
              Like {liveHelpful > 0 ? liveHelpful : ''}
            </button>
            <button
              disabled={!isAuthenticated || vote.isPending}
              onClick={() => handleVote('not_helpful')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                liveUserVote === 'not_helpful' ? 'bg-accent-light text-accent-dark' : 'text-muted hover:bg-surface'
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Dislike {liveNotHelpful > 0 ? liveNotHelpful : ''}
            </button>
            <button
              onClick={handleOpenComments}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Comment {liveCommentCount > 0 ? liveCommentCount : ''}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface"
            >
              {shareCopied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              {shareCopied ? 'Copied' : 'Share'}
            </button>
          </div>
        </div>

        {commentsOpen && (
          <div className="-mx-6 border-t border-border/50 bg-surface/60">
            {localComments.length > 0 && (
              <div className="space-y-0 px-5 pt-4">
                {localComments.map((c) => (
                  <ReviewCommentBubble key={c.id} comment={c} />
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <div className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-border transition-all focus-within:ring-primary/40">
                    <input
                      ref={commentInputRef}
                      className="flex-1 bg-transparent text-sm placeholder:text-muted outline-none"
                      placeholder="Write a comment..."
                      value={comment}
                      maxLength={FIELD_LIMITS.COMMENT_BODY}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                    />
                    <button
                      disabled={!comment.trim() || addComment.isPending}
                      onClick={handleSendComment}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white transition-all disabled:opacity-40 hover:bg-primary-dark"
                    >
                      {addComment.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2 pl-9 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={commentAnonymous}
                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  Comment anonymously
                </label>
              </div>
            ) : (
              <p className="px-5 py-4 text-xs text-muted">Log in to comment.</p>
            )}

            <button
              onClick={() => setCommentsOpen(false)}
              className="flex w-full items-center justify-center gap-1 py-2 text-xs text-muted transition-colors hover:bg-surface/80 hover:text-foreground"
            >
              <ChevronUp className="h-3 w-3" />
              Hide comments
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewCommentBubble({ comment }: { comment: ReviewComment }) {
  return (
    <div className="mb-3 flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        <User className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <div className="inline-block rounded-2xl rounded-tl-sm bg-white px-3 py-2 ring-1 ring-border/50">
          <p className="text-xs font-semibold text-foreground">{comment.author.displayName}</p>
          <p className="mt-0.5 text-sm text-foreground/85 whitespace-pre-line">{comment.body}</p>
        </div>
        <p className="mt-1 pl-1 text-[10px] text-muted">{formatRelativeTime(comment.createdAt)}</p>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [sort, setSort] = useState<'recent' | 'helpful' | 'trending'>('recent');
  const { mutate: trackStreakActivity } = useTrackStreakActivity();
  const hasTrackedVisitRef = useRef(false);

  const feed = useInfiniteFeedReviews({ pageSize: 10, sort, mine: isAuthenticated });
  const reviews = useMemo(() => {
    const flat = feed.data?.pages.flatMap((page) => page.data) ?? [];
    const seen = new Set<string>();
    return flat.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [feed.data]);
  const visibleReviews = useMemo(
    () => (isAuthenticated ? reviews : reviews.slice(0, 3)),
    [isAuthenticated, reviews],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      hasTrackedVisitRef.current = false;
      return;
    }

    if (hasTrackedVisitRef.current) return;

    hasTrackedVisitRef.current = true;
    trackStreakActivity({ activityType: 'feed_visit' });
  }, [isAuthenticated, trackStreakActivity]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
            <p className="text-sm text-muted">Latest trusted reviews and signals</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={sort === 'recent' ? 'primary' : 'outline'} onClick={() => setSort('recent')}>Recent</Button>
            <Button size="sm" variant={sort === 'helpful' ? 'primary' : 'outline'} onClick={() => setSort('helpful')}>Helpful</Button>
            <Button size="sm" variant={sort === 'trending' ? 'primary' : 'outline'} onClick={() => setSort('trending')}>
              <Star className="mr-1 h-3.5 w-3.5" />
              Trending
            </Button>
          </div>
        </div>

        {feed.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : visibleReviews.length === 0 ? (
          <EmptyState title="No reviews in feed yet" description="New reviews will appear here once published." />
        ) : (
          <div className="space-y-3">
            {visibleReviews.map((review) => (
              <FeedCard key={review.id} review={review} />
            ))}

            {!isAuthenticated && reviews.length > 3 && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-sm font-semibold text-foreground">Unlock full feed</p>
                  <p className="mt-1 text-sm text-muted">
                    Sign in to view all posts, vote, comment, and personalize your feed.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Link href="/auth/login">
                      <Button size="sm">Log In</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm" variant="outline">Sign Up</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAuthenticated && feed.hasNextPage && (
              <div className="pt-2 text-center">
                <Button onClick={() => feed.fetchNextPage()} loading={feed.isFetchingNextPage}>
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
