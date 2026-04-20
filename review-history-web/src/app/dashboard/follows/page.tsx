'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton, Card, Button } from '@/components/ui';
import { useMyFollows, useUnfollow } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';
import { CategoryIcon } from '@/components/shared/category-icon';
import Link from 'next/link';
import { MapPin, Star, Tag, Building2, UserMinus, Heart, Search, ExternalLink } from 'lucide-react';
import { cn, getInitials, ratingBgColor } from '@/lib/utils';
import type { Follow } from '@/types';

export default function FollowsPage() {
  const { data: follows, isLoading } = useMyFollows();
  const unfollowMut = useUnfollow();
  const toast = useToast();

  const entityFollows = follows?.filter((f) => f.targetType === 'entity') ?? [];
  const categoryFollows = follows?.filter((f) => f.targetType === 'category') ?? [];

  const handleUnfollow = (follow: Follow) => {
    unfollowMut.mutate(
      { targetType: follow.targetType, targetId: follow.targetId },
      {
        onSuccess: () => toast.success('Unfollowed successfully'),
        onError: () => toast.error('Failed to unfollow'),
      },
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Following</h1>
            <p className="mt-1 text-sm text-gray-500">
              Entities and categories you follow
              {follows?.length ? (
                <span className="ml-1 font-medium text-foreground">({follows.length})</span>
              ) : null}
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
          >
            <Search className="h-3.5 w-3.5" />
            Discover
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !follows?.length ? (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Nothing followed yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs">
                Follow entities and categories to get personalized updates in your feed.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
            >
              <Search className="h-4 w-4" />
              Discover entities to follow
            </Link>
          </Card>
        ) : (
          <>
            {/* Entities Section */}
            {entityFollows.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Entities
                  </h2>
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary-dark">
                    {entityFollows.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {entityFollows.map((follow) => {
                    const target = follow.target;
                    const name = target?.displayName || follow.targetName || 'Unknown Entity';
                    const rating = Number(target?.averageRating ?? 0);
                    const reviewCount = target?.reviewCount ?? 0;

                    return (
                      <Card
                        key={follow.id}
                        className="group flex items-center gap-4 p-4 transition-all hover:shadow-md hover:border-primary/20"
                      >
                        {/* Avatar */}
                        <Link href={`/entities/${follow.targetId}`} className="shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary/10 ring-2 ring-primary/10 transition-transform group-hover:scale-105">
                            <span className="text-sm font-bold text-primary-dark">
                              {getInitials(name)}
                            </span>
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/entities/${follow.targetId}`}
                            className="group/name flex items-center gap-1.5"
                          >
                            <h3 className="text-sm font-semibold text-foreground group-hover/name:text-primary transition-colors truncate">
                              {name}
                            </h3>
                            <ExternalLink className="h-3 w-3 text-muted opacity-0 group-hover/name:opacity-100 transition-opacity" />
                          </Link>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
                            {rating > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {rating.toFixed(1)}
                              </span>
                            )}
                            {reviewCount > 0 && (
                              <span>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
                            )}
                            {!rating && !reviewCount && (
                              <span className="italic">No reviews yet</span>
                            )}
                          </div>
                        </div>

                        {/* Rating badge */}
                        {rating > 0 && (
                          <div className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                            ratingBgColor(rating),
                          )}>
                            {rating.toFixed(1)}
                          </div>
                        )}

                        {/* Unfollow */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={unfollowMut.isPending}
                          onClick={() => handleUnfollow(follow)}
                          className="shrink-0 gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Unfollow
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Categories Section */}
            {categoryFollows.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Categories
                  </h2>
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary-dark">
                    {categoryFollows.length}
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {categoryFollows.map((follow) => {
                    const target = follow.target;
                    const name = target?.nameEn || target?.key || follow.targetName || 'Unknown Category';
                    const icon = target?.icon;

                    return (
                      <Card
                        key={follow.id}
                        className="group flex items-center gap-3 p-4 transition-all hover:shadow-md hover:border-primary/20"
                      >
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary/10">
                          {icon ? (
                            <CategoryIcon name={icon} className="h-5 w-5 text-primary-dark" />
                          ) : (
                            <Tag className="h-5 w-5 text-primary-dark" />
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
                          <p className="text-xs text-muted capitalize">Category</p>
                        </div>

                        {/* Unfollow */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={unfollowMut.isPending}
                          onClick={() => handleUnfollow(follow)}
                          className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
