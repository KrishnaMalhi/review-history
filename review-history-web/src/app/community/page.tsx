"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Rss,
  BookOpen,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Star,
  Loader2,
  Lock,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { useAuth } from '@/lib/auth-context';
import { useInfiniteFeedReviews, useTrackStreakActivity } from '@/hooks/use-api';
import { formatRelativeTime, truncate, cn } from '@/lib/utils';

const communityPillars = [
  {
    title: 'Verified Experiences',
    description: 'Community trust signals and moderation safeguards reduce manipulation and fake activity.',
    icon: ShieldCheck,
    tone: 'from-emerald-50 to-emerald-100/60 text-emerald-800 border-emerald-200/70',
  },
  {
    title: 'Open Conversations',
    description: 'Ask questions, share context, and get answers from people who faced similar situations.',
    icon: MessageCircle,
    tone: 'from-sky-50 to-blue-100/60 text-sky-800 border-sky-200/70',
  },
  {
    title: 'Learning Content',
    description: 'Read practical blogs and guides to make better decisions before spending time or money.',
    icon: BookOpen,
    tone: 'from-amber-50 to-orange-100/60 text-amber-800 border-amber-200/70',
  },
];

const sections = [
  {
    title: 'Community Feed',
    description: 'Browse latest reviews, apply filters, and follow what the community is discussing in real time.',
    href: '/feed',
    icon: Rss,
    cta: 'Explore feed',
  },
  {
    title: 'Discussions',
    description: 'Start a thread, ask for guidance, or add your perspective to ongoing conversations.',
    href: '/discussions',
    icon: MessageCircle,
    cta: 'Join discussions',
  },
  {
    title: 'Blogs and Guides',
    description: 'Read trusted how-to articles and explainers from the ReviewHistory editorial stream.',
    href: '/blogs',
    icon: BookOpen,
    cta: 'Read blogs',
  },
];

type RankingTab = 'latest' | 'trending' | 'following';

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<RankingTab>('latest');
  const { mutate: trackStreakActivity } = useTrackStreakActivity();
  const hasTrackedVisitRef = useRef(false);
  const showFollowingFeed = tab === 'following' && isAuthenticated;

  const feedQuery = useInfiniteFeedReviews({
    pageSize: 10,
    sort: tab === 'trending' ? 'top' : 'recent',
    ...(showFollowingFeed ? { following: true } : {}),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      hasTrackedVisitRef.current = false;
      return;
    }

    if (hasTrackedVisitRef.current) return;

    hasTrackedVisitRef.current = true;
    trackStreakActivity({ activityType: 'community_visit' });

    const interval = window.setInterval(() => {
      trackStreakActivity({ activityType: 'active_time', minutes: 5 });
    }, 5 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, trackStreakActivity]);

  const reviews = feedQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const rankingPreview = isAuthenticated ? reviews : reviews.slice(0, 3);

  return (
    <PublicLayout>
      <div className="relative min-h-screen overflow-hidden bg-surface">
        <div className="blob-green absolute -top-24 -right-16 h-72 w-72 opacity-20" />
        <div className="blob-orange absolute bottom-24 -left-12 h-56 w-56 opacity-15" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-3xl border border-border/70 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
              <Users className="h-3.5 w-3.5" />
              Community
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Real People. Real Stories. Better Decisions.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
              This community is designed for transparent experiences, practical advice, and trust-first participation.
              Discover what others are saying, contribute responsibly, and help improve the quality of local decisions.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark"
              >
                <Rss className="h-4 w-4" />
                Go to feed
              </Link>
              <Link
                href="/discussions"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
              >
                <MessageCircle className="h-4 w-4" />
                Start discussing
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface/60 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Community Rankings</p>
                <Link href="/feed" className="text-xs font-medium text-primary hover:underline">View full feed</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'latest', label: 'Latest' },
                  { key: 'trending', label: 'Trending' },
                  { key: 'following', label: 'Following' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
                      tab === item.key
                        ? 'bg-primary text-white'
                        : 'bg-white text-foreground ring-1 ring-border hover:bg-primary-light',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === 'following' && !isAuthenticated ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <Lock className="h-3.5 w-3.5" />
                  Sign in to see ranking from entities you follow.
                </div>
              ) : feedQuery.isLoading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading rankings...
                </div>
              ) : reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No ranked reviews available right now.</p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {rankingPreview.map((review, index) => (
                    <article key={review.id} className="rounded-xl border border-border bg-white p-3">
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-primary">#{index + 1} • {review.entity.categoryName}</p>
                          <Link href={`/entities/${review.entity.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                            {review.entity.name}
                          </Link>
                        </div>
                        <span className="rounded-lg bg-primary-light px-2 py-1 text-xs font-semibold text-primary-dark">
                          {review.overallRating}/5
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted">{truncate(review.body, 140)}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                        <span>{review.helpfulCount} helpful</span>
                        <span>{formatRelativeTime(review.publishedAt || review.createdAt)}</span>
                      </div>
                    </article>
                  ))}
                  {!isAuthenticated && reviews.length > 3 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Sign in to unlock full community rankings and personalized signals.
                    </div>
                  )}

                  {isAuthenticated && feedQuery.hasNextPage && (
                    <div className="pt-1 text-center">
                      <button
                        onClick={() => feedQuery.fetchNextPage()}
                        disabled={feedQuery.isFetchingNextPage}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
                          feedQuery.isFetchingNextPage
                            ? 'bg-surface text-muted'
                            : 'bg-primary text-white hover:bg-primary-dark',
                        )}
                      >
                        {feedQuery.isFetchingNextPage ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {communityPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm ${pillar.tone}`}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold">{pillar.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed opacity-90">{pillar.description}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.title}
                  className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary-light to-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{section.description}</p>
                  <Link
                    href={section.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-primary-dark"
                  >
                    {section.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-primary/20 bg-linear-to-r from-primary-light/60 via-white to-accent-light/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Community standards matter</p>
                <p className="mt-1 text-xs text-muted">
                  Participate respectfully and review our policies before posting.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/review-policy"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Review policy
                </Link>
                <Link
                  href="/community/moderation"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Moderation center
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white hover:bg-secondary-light"
                >
                  <Star className="h-3.5 w-3.5" />
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
