'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Pencil, Tag } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button, Card, Skeleton } from '@/components/ui';
import { useAdminBlog } from '@/hooks/use-api';

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const blogId = params.id;
  const router = useRouter();
  const blogQuery = useAdminBlog(blogId);

  if (blogQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  const post = blogQuery.data;
  if (!post) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">Blog not found</h2>
          <p className="mt-1 text-sm text-muted">The requested blog post does not exist.</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/blogs')}>
            Back to List
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const status = post.status || (post.isPublished ? 'PUBLISHED' : 'DRAFT');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
              <span className="inline-flex rounded-full bg-primary-light px-2 py-1 text-xs font-medium text-primary-dark">
                {status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Created on {new Date(post.createdAt).toLocaleDateString()}
              {post.publishedAt ? ` • Published on ${new Date(post.publishedAt).toLocaleDateString()}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/blogs')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
            <Link href={`/blogs/${post.id}/edit`}>
              <Button className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Post
              </Button>
            </Link>
            <a href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/blogs/${post.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Public
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {post.featuredImage && (
              <Card className="overflow-hidden p-0">
                <div className="aspect-video bg-surface">
                  <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Excerpt</h2>
              <p className="text-sm text-muted">{post.excerpt || '-'}</p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Content</h2>
              <div className="prose max-w-none text-sm text-foreground/90 whitespace-pre-wrap">
                {post.content}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Post Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Category</p>
                  <p className="text-foreground">{post.category?.name || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Slug</p>
                  <p className="font-mono text-foreground break-all">{post.slug}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Read Time</p>
                  <p className="text-foreground">{post.readTime ?? '-'} min</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Views</p>
                  <p className="text-foreground">{post.views ?? 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">SEO</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">SEO Title</p>
                  <p className="text-foreground">{post.seoTitle || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">SEO Description</p>
                  <p className="text-foreground">{post.seoDescription || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Keywords</p>
                  <p className="text-foreground">{post.keywords?.join(', ') || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Canonical URL</p>
                  <p className="break-all text-foreground">{post.canonicalUrl || '-'}</p>
                </div>
              </div>
            </Card>

            {post.tags && post.tags.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-3 text-lg font-semibold text-foreground">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-xs text-foreground">
                      <Tag className="h-3 w-3" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
