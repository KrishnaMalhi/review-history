'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Calendar, Clock, Search, Sparkles, TrendingUp } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { useBlogs } from '@/hooks/use-api';
import { formatDate, cn } from '@/lib/utils';
import { Button, EmptyState, Input, Skeleton } from '@/components/ui';
import { FIELD_LIMITS } from '@shared/field-limits';

function readingTime(text: string) {
  const words = text?.trim().split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

function getReadTime(blog: { readTime?: number | null; excerpt?: string | null; content?: string }) {
  if (blog.readTime && blog.readTime > 0) return blog.readTime;
  return readingTime((blog.excerpt || '') + (blog.content || ''));
}

const CARD_GRADIENTS = [
  'from-primary/10 to-primary-light',
  'from-amber-50 to-orange-50',
  'from-blue-50 to-indigo-50',
  'from-rose-50 to-pink-50',
  'from-teal-50 to-emerald-50',
  'from-violet-50 to-purple-50',
];

export default function BlogsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBlogs({ page, pageSize: 9, ...(q.trim() ? { q: q.trim() } : {}) });

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-surface min-h-screen">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-20" />
        <div className="blob-orange absolute bottom-40 -left-10 h-48 w-48 opacity-15" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Blogs</h1>
                <p className="text-sm text-muted">Guides, insights, and practical tips</p>
              </div>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                className="pl-9"
                placeholder="Search blogs..."
                value={q}
                maxLength={FIELD_LIMITS.SEARCH_Q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <EmptyState title="No blogs found" description="Try a different keyword or check back soon." />
          ) : (
            <>
              {/* Featured post (first) */}
              {page === 1 && !q && data.data.length > 0 && (
                <Link href={`/blogs/${data.data[0].slug}`} className="mb-6 block group">
                  <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-primary/10 via-primary-light to-primary/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                      <BookOpen className="h-16 w-16 text-primary opacity-30 absolute right-10 top-6 rotate-12" />
                      <div className="relative px-8 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm mb-3">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                        <h2 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {data.data[0].title}
                        </h2>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="line-clamp-2 text-sm text-muted">{data.data[0].excerpt || 'Read the full article for details.'}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {data.data[0].publishedAt ? formatDate(data.data[0].publishedAt) : formatDate(data.data[0].createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {getReadTime(data.data[0])} min read
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-medium text-primary">
                          <TrendingUp className="h-3.5 w-3.5" /> Read more
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(page === 1 && !q ? data.data.slice(1) : data.data).map((blog, i) => (
                  <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group">
                    <div className="h-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
                      <div className={cn(
                        'flex h-36 items-center justify-center bg-gradient-to-br relative overflow-hidden',
                        CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                      )}>
                        <BookOpen className="h-10 w-10 text-primary/40 absolute right-4 bottom-3 rotate-6" />
                        <div className="relative px-5 text-center">
                          <h2 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                            {blog.title}
                          </h2>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 text-xs text-muted">{blog.excerpt || 'Read the full article for details.'}</p>
                        {blog.category?.name && (
                          <div className="mt-2 text-[11px] font-medium text-primary">{blog.category.name}</div>
                        )}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {getReadTime(blog)} min
                            </span>
                          </div>
                          <span className="font-medium text-primary">Read →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-foreground ring-1 ring-border">
                    {data.meta.page} / {data.meta.totalPages}
                  </span>
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
