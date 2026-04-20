'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft, BookOpen, Calendar, Clock, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { PublicLayout } from '@/components/layout';
import { useBlog } from '@/hooks/use-api';
import { formatDate, truncate } from '@/lib/utils';
import { Button, Skeleton } from '@/components/ui';

function readingTime(text: string) {
  const words = text?.trim().split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: blog, isLoading } = useBlog(slug);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: blog?.title || 'Blog', text: blog?.excerpt || '', url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const mins = readingTime((blog?.excerpt || '') + (blog?.content || ''));

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/blogs">
            <Button variant="ghost" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
          {blog && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-all hover:bg-surface hover:text-foreground active:scale-95"
            >
              {shareSuccess ? (
                <><Check className="h-4 w-4 text-primary" /> Copied!</>
              ) : (
                <><Share2 className="h-4 w-4" /> Share</>
              )}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-1/3 rounded-lg" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        ) : !blog ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">Blog not found.</p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {/* Cover */}
            <div className="flex h-56 items-center justify-center bg-gradient-to-br from-primary/10 via-primary-light to-primary/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
              <BookOpen className="h-14 w-14 text-primary/30 absolute right-12 top-8 rotate-12" />
              <div className="relative px-8 text-center max-w-lg">
                <h1 className="text-2xl font-bold text-foreground leading-snug">{blog.title}</h1>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Meta */}
              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {mins} min read
                </span>
                <span className="text-border">·</span>
                <span>By {blog.author?.displayName || 'ReviewHistory Team'}</span>
              </div>

              {blog.excerpt && (
                <blockquote className="mb-6 rounded-xl border-l-4 border-primary bg-primary-light/40 py-3 pl-4 pr-3 text-sm text-foreground/80 italic">
                  {blog.excerpt}
                </blockquote>
              )}

              <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground/90 leading-relaxed">
                {blog.content}
              </div>

              {/* Footer CTA */}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Link href="/blogs">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> More articles
                  </Button>
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-all hover:bg-surface hover:text-foreground"
                >
                  {shareSuccess ? (
                    <><Check className="h-3.5 w-3.5 text-primary" /> Copied!</>
                  ) : (
                    <><Share2 className="h-3.5 w-3.5" /> Share</>
                  )}
                </button>
              </div>
            </div>
          </article>
        )}
      </div>
    </PublicLayout>
  );
}


