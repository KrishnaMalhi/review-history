'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Button, Card, CardContent, Badge, CardSkeleton, EmptyState } from '@/components/ui';
import { useSearchEntities, useCategories, useCities } from '@/hooks/use-api';
import { TrustScoreBadge } from '@/components/shared/trust-score';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FIELD_LIMITS } from '@shared/field-limits';
const sortOptions = [
  { value: '', label: 'Relevance' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'rating_asc', label: 'Lowest Rated' },
  { value: 'reviews_desc', label: 'Most Reviews' },
  { value: 'trust_desc', label: 'Highest Trust' },
  { value: 'newest', label: 'Newest' },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  const { data: categories } = useCategories();
  const { data: cities } = useCities();

  const params: Record<string, unknown> = { page, pageSize: 12 };
  if (query) params.q = query;
  if (category) params.categoryKey = category;
  if (city) params.cityId = city;
  if (sort) params.sort = sort;
  if (minRating) params.minRating = minRating;

  const { data, isLoading } = useSearchEntities(params);

  useEffect(() => {
    if (!data?.meta?.totalPages) return;
    if (page > data.meta.totalPages) {
      setPage(data.meta.totalPages);
    }
    if (page < 1) {
      setPage(1);
    }
  }, [data?.meta?.totalPages, page]);

  const getVisiblePages = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push('ellipsis');
    }

    for (let pageNum = start; pageNum <= end; pageNum += 1) {
      pages.push(pageNum);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const sp = new URLSearchParams();
      if (query) sp.set('q', query);
      if (category) sp.set('category', category);
      if (city) sp.set('city', city);
      if (sort) sp.set('sort', sort);
      if (minRating) sp.set('minRating', minRating);
      if (page > 1) sp.set('page', String(page));
      router.replace(sp.toString() ? `/search?${sp.toString()}` : '/search');
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, category, city, sort, minRating, page, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setCity('');
    setSort('');
    setMinRating('');
    setPage(1);
    router.push('/search');
  };

  const hasFilters = !!(query || category || city || sort || minRating);
  const activeFilterCount = [category, city, sort, minRating].filter(Boolean).length;

  const selectedCategoryName = categories?.find((c) => c.key === category)?.name;
  const selectedCityName = cities?.find((c) => c.id === city)?.name;
  const selectedSortLabel = sortOptions.find((o) => o.value === sort)?.label;
  const selectedRatingLabel = minRating ? `${minRating}+ Stars` : '';

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-surface min-h-screen">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-20" />
        <div className="blob-orange absolute bottom-40 -left-10 h-48 w-48 opacity-15" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />

          {/* Search Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {query ? <>Results for &ldquo;<span className="gradient-text-green">{query}</span>&rdquo;</> : 'Search Reviews'}
                </h1>
                {data?.meta?.total !== undefined && (
                  <p className="text-sm text-muted">
                    {data.meta.total} result{data.meta.total !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
            </div>

            {categories && categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setCategory(''); setPage(1); }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    !category ? 'bg-primary text-white' : 'bg-white text-muted ring-1 ring-border hover:bg-surface'
                  }`}
                >
                  All categories
                </button>
                {categories.slice(0, 6).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => { setCategory(c.key); setPage(1); }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      category === c.key
                        ? 'bg-primary text-white'
                        : 'bg-white text-muted ring-1 ring-border hover:bg-surface'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search & Filter Panel */}
          <form onSubmit={handleSearch} className="mb-8 space-y-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">

            {/* Primary Search Bar */}
            <div className="flex flex-col gap-3 p-5 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={query}
                  maxLength={FIELD_LIMITS.SEARCH_Q}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, category, or location..."
                  className="w-full rounded-xl border border-border bg-surface/50 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted/60 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
                />
              </div>
              <Button type="submit" className="gap-2 px-6 shrink-0">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Filter Section */}
            <div className="border-t border-border/60 bg-gradient-to-r from-surface/80 to-surface/40 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-light">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-red-200/50 transition-colors hover:bg-red-100"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categories && (
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                      className={`w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-9 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        category
                          ? 'border-primary/40 bg-primary-light text-primary-dark font-medium'
                          : 'border-border bg-white text-muted hover:border-border/80'
                      }`}
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.key} value={c.key}>{c.name}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                )}
                {cities && (
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setPage(1); }}
                      className={`w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-9 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        city
                          ? 'border-accent/40 bg-accent-light text-accent-dark font-medium'
                          : 'border-border bg-white text-muted hover:border-border/80'
                      }`}
                    >
                      <option value="">All Cities</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                )}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className={`w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-9 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      sort
                        ? 'border-navy/30 bg-navy/5 text-navy font-medium'
                        : 'border-border bg-white text-muted hover:border-border/80'
                    }`}
                  >
                    <option value="">Sort by</option>
                    {sortOptions.filter((o) => o.value).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="relative">
                  <select
                    value={minRating}
                    onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
                    className={`w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-9 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      minRating
                        ? 'border-star/40 bg-star-light text-amber-700 font-medium'
                        : 'border-border bg-white text-muted hover:border-border/80'
                    }`}
                  >
                    <option value="">Min Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-white px-5 py-3">
                <span className="text-xs font-medium text-muted">Active:</span>
                {selectedCategoryName && (
                  <button type="button" onClick={() => setCategory('')} className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark ring-1 ring-primary/20 transition-colors hover:bg-primary/10">
                    {selectedCategoryName}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedCityName && (
                  <button type="button" onClick={() => setCity('')} className="inline-flex items-center gap-1 rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent-dark ring-1 ring-accent/20 transition-colors hover:bg-accent/10">
                    <MapPin className="h-3 w-3" />
                    {selectedCityName}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedSortLabel && (
                  <button type="button" onClick={() => setSort('')} className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy ring-1 ring-navy/15 transition-colors hover:bg-navy/10">
                    <ArrowUpDown className="h-3 w-3" />
                    {selectedSortLabel}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedRatingLabel && (
                  <button type="button" onClick={() => setMinRating('')} className="inline-flex items-center gap-1 rounded-full bg-star-light px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-star/20 transition-colors hover:bg-star/10">
                    <Star className="h-3 w-3 fill-star text-star" />
                    {selectedRatingLabel}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Results - Enhanced card style */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <EmptyState
              title="No results found"
              description="Try different search terms or browse categories."
            />
          ) : (
            <>
              <div className="space-y-4">
                {data.data.map((entity) => (
                  <Link key={entity.id} href={`/entities/${entity.id}`}>
                    <div className="card-hover group rounded-2xl border border-border/80 bg-white p-5 cursor-pointer">
                      <div className="flex items-start gap-4">
                        {/* Rating circle */}
                        <div className="hidden sm:flex shrink-0 flex-col items-center gap-1">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-md ${
                            (entity.averageRating || 0) >= 4 ? 'bg-trust-excellent shadow-trust-excellent/20' :
                            (entity.averageRating || 0) >= 3 ? 'bg-trust-great shadow-trust-great/20' :
                            (entity.averageRating || 0) >= 2 ? 'bg-trust-average shadow-trust-average/20' : 'bg-trust-poor shadow-trust-poor/20'
                          }`}>
                            {entity.averageRating?.toFixed(1) || '—'}
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${
                                  s <= Math.round(entity.averageRating || 0)
                                    ? 'fill-star text-star'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                {entity.name}
                              </h3>
                              {entity.address && (
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  {entity.address}
                                </p>
                              )}
                            </div>
                            {entity.trustScore > 0 && (
                              <TrustScoreBadge score={entity.trustScore} size="sm" />
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge>{entity.categoryName || entity.categoryKey}</Badge>
                            {entity.city && <Badge variant="info">{entity.city}</Badge>}
                            {entity.isClaimed && <Badge variant="success">Claimed</Badge>}
                            <span className="text-xs text-muted ml-1">
                              {entity.reviewCount || 0} review{entity.reviewCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {getVisiblePages(page, data.meta.totalPages).map((pageItem, index) => {
                      if (pageItem === 'ellipsis') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={pageItem}
                          onClick={() => setPage(pageItem)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            page === pageItem
                              ? 'bg-primary text-white'
                              : 'text-muted hover:bg-surface'
                          }`}
                        >
                          {pageItem}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
