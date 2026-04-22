'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, Eye, Pencil, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button, Card, Input, Select, Skeleton } from '@/components/ui';
import { useToast } from '@/components/shared/toast';
import { useAdminBlogs, useDeleteBlog, useUpdateBlog, type AdminBlog } from '@/hooks/use-api';
import { FIELD_LIMITS } from '@shared/field-limits';

function formatStatus(blog: AdminBlog) {
  return blog.status || (blog.isPublished ? 'PUBLISHED' : 'DRAFT');
}

export default function AdminBlogsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const toast = useToast();

  const blogsQuery = useAdminBlogs({ page, pageSize: 20, ...(q.trim() ? { q: q.trim() } : {}) });
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const rows = useMemo(() => blogsQuery.data?.data ?? [], [blogsQuery.data?.data]);
  const meta = blogsQuery.data?.meta;

  const handleStatusChange = async (blog: AdminBlog, nextStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    try {
      await updateBlog.mutateAsync({
        id: blog.id,
        status: nextStatus,
        isPublished: nextStatus === 'PUBLISHED',
        publishedAt: nextStatus === 'PUBLISHED' && !blog.publishedAt ? new Date().toISOString() : blog.publishedAt || undefined,
      });
      toast.success('Blog status updated');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to update blog status';
      toast.error(message);
    }
  };

  const handleDelete = async (blog: AdminBlog) => {
    const confirmed = window.confirm(`Delete "${blog.title}"?`);
    if (!confirmed) return;
    try {
      await deleteBlog.mutateAsync(blog.id);
      toast.success('Blog deleted');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to delete blog';
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
              <p className="text-sm text-muted">Manage blog posts using dedicated create/edit/view pages.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/blogs/categories">
              <Button variant="outline" className="gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/blogs/tags">
              <Button variant="outline" className="gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Button>
            </Link>
            <Link href="/blogs/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Post
              </Button>
            </Link>
          </div>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              maxLength={FIELD_LIMITS.SEARCH_Q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search blogs by title, slug, category..."
              className="pl-9"
            />
          </div>
        </Card>

        {blogsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card className="p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted/40" />
            <p className="mt-3 text-sm text-muted">No blogs found.</p>
            <Link href="/blogs/new">
              <Button variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create first blog
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Title</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Author</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Category</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Published</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rows.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{blog.title}</p>
                        <p className="text-xs text-muted">/{blog.slug}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{blog.author?.displayName || 'Unknown'}</td>
                      <td className="px-5 py-3.5 text-muted">{blog.category?.name || 'Uncategorized'}</td>
                      <td className="px-5 py-3.5">
                        <Select
                          value={formatStatus(blog)}
                          onChange={(e) => handleStatusChange(blog, e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                          options={[
                            { value: 'DRAFT', label: 'Draft' },
                            { value: 'PUBLISHED', label: 'Published' },
                            { value: 'ARCHIVED', label: 'Archived' },
                          ]}
                          className="min-w-[135px]"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Not published'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/blogs/${blog.id}`}>
                            <button className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-light hover:text-primary-dark" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/blogs/${blog.id}/edit`}>
                            <button className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-light hover:text-primary-dark" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(blog)}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
