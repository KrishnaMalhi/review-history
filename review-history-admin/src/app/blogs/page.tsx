'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button, Card, Input, Modal, Skeleton } from '@/components/ui';
import { useToast } from '@/components/shared/toast';
import {
  useAdminBlogs,
  useCreateBlog,
  useDeleteBlog,
  useUpdateBlog,
  type AdminBlog,
} from '@/hooks/use-api';

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
}

const emptyForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  isPublished: false,
};

export default function AdminBlogsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<AdminBlog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlog | null>(null);
  const [form, setForm] = useState<BlogFormState>(emptyForm);

  const toast = useToast();
  const blogsQuery = useAdminBlogs({ page, pageSize: 20, ...(q.trim() ? { q: q.trim() } : {}) });
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const isSaving = createBlog.isPending || updateBlog.isPending;
  const rows = useMemo(() => blogsQuery.data?.data ?? [], [blogsQuery.data?.data]);
  const meta = blogsQuery.data?.meta;

  function openCreateModal() {
    setEditingBlog(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(blog: AdminBlog) {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      coverImage: blog.coverImage || '',
      isPublished: blog.isPublished,
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingBlog) {
        await updateBlog.mutateAsync({
          id: editingBlog.id,
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          content: form.content,
          coverImage: form.coverImage || undefined,
          isPublished: form.isPublished,
        });
        toast.success('Blog updated');
      } else {
        await createBlog.mutateAsync({
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || undefined,
          content: form.content,
          coverImage: form.coverImage || undefined,
          isPublished: form.isPublished,
        });
        toast.success('Blog created');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingBlog(null);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to save blog';
      toast.error(message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBlog.mutateAsync(deleteTarget.id);
      toast.success('Blog deleted');
      setDeleteTarget(null);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to delete blog';
      toast.error(message);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blogs</h1>
              <p className="text-sm text-muted">Create and manage public blog posts.</p>
            </div>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            New Blog
          </Button>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search blogs by title, slug, or excerpt..."
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
            <Button onClick={openCreateModal} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create first blog
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Title</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Slug</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Author</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Published</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rows.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-5 py-3.5 font-medium text-foreground">{blog.title}</td>
                      <td className="px-5 py-3.5">
                        <code className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">
                          {blog.slug}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{blog.author?.displayName || 'Unknown'}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={
                            blog.isPublished
                              ? 'inline-flex rounded-full bg-primary-light px-2 py-1 text-xs font-medium text-primary-dark'
                              : 'inline-flex rounded-full bg-surface px-2 py-1 text-xs font-medium text-muted'
                          }
                        >
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(blog)}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-light hover:text-primary-dark"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(blog)}
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
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingBlog ? 'Edit Blog' : 'Create Blog'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            maxLength={200}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            required
          />
          <Input
            label="Slug (optional)"
            value={form.slug}
            maxLength={240}
            onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value.toLowerCase().trim() }))}
            placeholder="Auto-generated if empty"
          />
          <Input
            label="Excerpt (optional)"
            value={form.excerpt}
            maxLength={400}
            onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
          />
          <Input
            label="Cover Image URL (optional)"
            value={form.coverImage}
            maxLength={500}
            onChange={(e) => setForm((s) => ({ ...s, coverImage: e.target.value }))}
            placeholder="https://..."
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">Content</span>
            <textarea
              value={form.content}
              maxLength={50000}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              rows={12}
              required
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none ring-offset-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Publish now</span>
          </label>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {editingBlog ? 'Update Blog' : 'Create Blog'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Blog">
        <p className="text-sm text-muted">
          Are you sure you want to delete{' '}
          <strong className="text-foreground">{deleteTarget?.title}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleDelete} loading={deleteBlog.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
