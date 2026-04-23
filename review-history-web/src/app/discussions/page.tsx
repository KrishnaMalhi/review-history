'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  Send,
  User,
  PlusCircle,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Loader2,
  X,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Button, Card, CardContent, EmptyState, Input, Skeleton } from '@/components/ui';
import {
  useAddDiscussionComment,
  useCreateDiscussion,
  useInfiniteDiscussions,
  useInfiniteMyAwareDiscussions,
  useReactDiscussion,
  useTrackStreakActivity,
} from '@/hooks/use-api';
import { useDiscussionSocket } from '@/hooks/use-socket';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime, cn, truncate } from '@/lib/utils';
import type { DiscussionPost, DiscussionComment } from '@/types';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function DiscussionsPage() {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  const myAwareQuery = useInfiniteMyAwareDiscussions({ pageSize: 15 });
  const publicQuery = useInfiniteDiscussions({ pageSize: 15 });
  const infiniteQuery = isAuthenticated ? myAwareQuery : publicQuery;

  const createDiscussion = useCreateDiscussion();
  const { mutate: trackStreakActivity } = useTrackStreakActivity();
  const raw = infiniteQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const seen = new Set<string>();
  const discussions = raw.filter((d) => { if (seen.has(d.id)) return false; seen.add(d.id); return true; });
  const visibleDiscussions = isAuthenticated ? discussions : discussions.slice(0, 3);
  const totalCount = infiniteQuery.data?.pages[0]?.meta?.total ?? 0;

  const hasTrackedVisitRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasTrackedVisitRef.current = false;
      return;
    }

    if (hasTrackedVisitRef.current) return;

    hasTrackedVisitRef.current = true;
    trackStreakActivity({ activityType: 'discussion_visit' });

    const interval = window.setInterval(() => {
      trackStreakActivity({ activityType: 'active_time', minutes: 5 });
    }, 5 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, trackStreakActivity]);

  const handleCreate = async () => {
    if (!body.trim()) return;
    await createDiscussion.mutateAsync({
      title: title.trim() || undefined,
      body: body.trim(),
      isAnonymous,
    });
    setTitle('');
    setBody('');
    setIsAnonymous(true);
    setShowCompose(false);
  };

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-surface min-h-screen">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-20" />
        <div className="blob-orange absolute bottom-40 -left-10 h-48 w-48 opacity-15" />

        <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community Discussions</h1>
                <p className="text-sm text-muted">
                  {totalCount > 0 ? `${totalCount} posts` : 'Share stories and ask questions'}
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowCompose(!showCompose)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Post
              </button>
            )}
          </div>

          {/* Compose Panel */}
          {isAuthenticated && showCompose && (
            <Card className="mb-6 ring-2 ring-primary/20 shadow-lg">
              <CardContent className="pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">New Discussion</p>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="rounded-lg p-1 text-muted hover:bg-surface hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Title (optional)"
                    value={title}
                    maxLength={FIELD_LIMITS.REVIEW_TITLE}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    value={body}
                    maxLength={FIELD_LIMITS.REPLY_BODY}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder="Share your story or question..."
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      Post anonymously
                    </label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCompose(false)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        loading={createDiscussion.isPending}
                        disabled={!body.trim()}
                        className="gap-1.5"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discussion List */}
          {infiniteQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : visibleDiscussions.length === 0 ? (
            <EmptyState
              title="No discussions yet"
              description={
                isAuthenticated
                  ? 'Start the first discussion in your community.'
                  : 'Log in to create the first discussion.'
              }
            />
          ) : (
            <div className="space-y-4">
              {visibleDiscussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  isAuthenticated={isAuthenticated}
                />
              ))}

              {!isAuthenticated && discussions.length > 3 && (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-sm font-semibold text-foreground">Continue the conversation</p>
                    <p className="mt-1 text-sm text-muted">
                      Log in to view all discussions, react, and comment.
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

              {isAuthenticated && infiniteQuery.hasNextPage && (
                <div className="pt-2 text-center">
                  <Button
                    onClick={() => infiniteQuery.fetchNextPage()}
                    loading={infiniteQuery.isFetchingNextPage}
                  >
                    Load More
                  </Button>
                </div>
              )}

              {isAuthenticated && infiniteQuery.isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted">Loading more...</span>
                </div>
              )}

              {isAuthenticated && !infiniteQuery.hasNextPage && discussions.length > 5 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All caught up!</p>
                  <p className="text-xs text-muted">You&apos;ve seen all {totalCount} discussions</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

/* ── Discussion Card ── */
function DiscussionCard({
  discussion: initialDiscussion,
  isAuthenticated,
}: {
  discussion: DiscussionPost;
  isAuthenticated: boolean;
}) {
  const [discussion, setDiscussion] = useState(initialDiscussion);
  const [liveLikeCount, setLiveLikeCount] = useState(initialDiscussion.likeCount);
  const [liveDislikeCount, setLiveDislikeCount] = useState(initialDiscussion.dislikeCount);
  const [liveUserReaction, setLiveUserReaction] = useState<'like' | 'dislike' | null>(
    initialDiscussion.userReaction ?? null,
  );
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [localComments, setLocalComments] = useState<DiscussionComment[]>(discussion.comments);
  const [comment, setComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const react = useReactDiscussion(discussion.id);
  const addComment = useAddDiscussionComment(discussion.id);
  const trackStreakActivity = useTrackStreakActivity();

  useEffect(() => {
    setDiscussion(initialDiscussion);
    setLiveLikeCount(initialDiscussion.likeCount);
    setLiveDislikeCount(initialDiscussion.dislikeCount);
    setLiveUserReaction(initialDiscussion.userReaction ?? null);
    setLocalComments(initialDiscussion.comments);
  }, [initialDiscussion]);

  useDiscussionSocket(
    discussion.id,
    (payload) => {
      const incoming = payload.comment as DiscussionComment;
      setLocalComments((prev) => {
        if (prev.find((c) => c.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
      setDiscussion((d) => ({ ...d, commentCount: d.commentCount + 1 }));
    },
    (payload) => {
      setLiveLikeCount(payload.likeCount);
      setLiveDislikeCount(payload.dislikeCount);
    },
  );

  const handleReact = (type: 'like' | 'dislike') => {
    if (!isAuthenticated || react.isPending) return;

    const prevReaction = liveUserReaction;
    const prevLike = liveLikeCount;
    const prevDislike = liveDislikeCount;

    if (type === 'like') {
      if (prevReaction === 'like') {
        setLiveUserReaction(null);
        setLiveLikeCount((v) => Math.max(0, v - 1));
      } else if (prevReaction === 'dislike') {
        setLiveUserReaction('like');
        setLiveLikeCount((v) => v + 1);
        setLiveDislikeCount((v) => Math.max(0, v - 1));
      } else {
        setLiveUserReaction('like');
        setLiveLikeCount((v) => v + 1);
      }
    } else {
      if (prevReaction === 'dislike') {
        setLiveUserReaction(null);
        setLiveDislikeCount((v) => Math.max(0, v - 1));
      } else if (prevReaction === 'like') {
        setLiveUserReaction('dislike');
        setLiveDislikeCount((v) => v + 1);
        setLiveLikeCount((v) => Math.max(0, v - 1));
      } else {
        setLiveUserReaction('dislike');
        setLiveDislikeCount((v) => v + 1);
      }
    }

    react.mutate(type, {
      onSuccess: (result: any) => {
        if (typeof result?.likeCount === 'number') setLiveLikeCount(result.likeCount);
        if (typeof result?.dislikeCount === 'number') setLiveDislikeCount(result.dislikeCount);
        setLiveUserReaction((result?.userReaction as 'like' | 'dislike' | null) ?? null);
      },
      onError: () => {
        setLiveUserReaction(prevReaction);
        setLiveLikeCount(prevLike);
        setLiveDislikeCount(prevDislike);
      },
    });
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.href}#${discussion.id}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: discussion.title || 'Community Discussion',
          text: truncate(discussion.body, 100),
          url,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }

    if (isAuthenticated) {
      trackStreakActivity.mutate({ activityType: 'share' });
    }
  };

  const handleOpenComments = () => {
    setCommentsOpen(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    const result = await addComment.mutateAsync({
      body: comment.trim(),
      isAnonymous: commentAnonymous,
    }) as DiscussionComment;
    setLocalComments((prev) => {
      if (prev.find((c) => c.id === result.id)) return prev;
      return [...prev, result];
    });
    setDiscussion((d) => ({ ...d, commentCount: d.commentCount + 1 }));
    setComment('');
    setCommentAnonymous(false);
  };

  const isTrending =
    discussion.likeCount >= 5 || discussion.likeCount + discussion.commentCount >= 8;
  const bodyIsLong = discussion.body.length > 300;
  const displayBody =
    bodyIsLong && !expanded ? truncate(discussion.body, 300) : discussion.body;

  return (
    <article
      id={discussion.id}
      className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20"
    >
      {isTrending && (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-1.5 text-xs font-medium text-amber-700">
          <Flame className="h-3 w-3 text-orange-500" />
          Trending Discussion
        </div>
      )}

      {/* Author row */}
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary/10 text-primary ring-1 ring-primary/10">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{discussion.author.displayName}</p>
            <p className="text-[11px] text-muted">{formatRelativeTime(discussion.createdAt)}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Live
        </span>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {discussion.title && (
          <h3 className="mb-1.5 text-base font-semibold text-foreground">{discussion.title}</h3>
        )}
        <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{displayBody}</p>
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

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-border/50 px-3 py-1.5">
        <button
          onClick={() => handleReact('like')}
          disabled={!isAuthenticated || react.isPending}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
            liveUserReaction === 'like'
              ? 'bg-primary-light text-primary'
              : 'text-muted hover:bg-surface',
            !isAuthenticated && 'cursor-not-allowed opacity-50',
          )}
        >
          <ThumbsUp
            className={cn('h-3.5 w-3.5', liveUserReaction === 'like' && 'fill-primary')}
          />
          Like {liveLikeCount > 0 ? liveLikeCount : ''}
        </button>

        <button
          onClick={() => handleReact('dislike')}
          disabled={!isAuthenticated || react.isPending}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
            liveUserReaction === 'dislike'
              ? 'bg-accent-light text-accent-dark'
              : 'text-muted hover:bg-surface',
            !isAuthenticated && 'cursor-not-allowed opacity-50',
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Dislike {liveDislikeCount > 0 ? liveDislikeCount : ''}
        </button>

        <button
          onClick={handleOpenComments}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Comment {discussion.commentCount > 0 ? discussion.commentCount : ''}
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface"
        >
          {shareSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" /> Share
            </>
          )}
        </button>
      </div>

      {/* Comments panel — opens inline like Facebook */}
      {commentsOpen && (
        <div className="border-t border-border/50 bg-surface/60">
          {localComments.length > 0 && (
            <div className="space-y-0 px-5 pt-4">
              {localComments.map((c) => (
                <CommentBubble key={c.id} comment={c} />
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
    </article>
  );
}

function CommentBubble({ comment }: { comment: DiscussionComment }) {
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
