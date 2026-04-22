'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button, Card, Input, Modal, Skeleton } from '@/components/ui';
import { useToast } from '@/components/shared/toast';
import {
  BlogTag,
  useAdminBlogTags,
  useCreateBlogTag,
  useDeleteBlogTag,
  useUpdateBlogTag,
} from '@/hooks/use-api';
import { FIELD_LIMITS } from '@shared/field-limits';

interface FormState {
  name: string;
  slug: string;
}

const emptyState: FormState = { name: '', slug: '' };

export default function BlogTagsPage() {
  const toast = useToast();
  const tagsQuery = useAdminBlogTags();
  const createMutation = useCreateBlogTag();
  const updateMutation = useUpdateBlogTag();
  const deleteMutation = useDeleteBlogTag();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogTag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogTag | null>(null);
  const [form, setForm] = useState<FormState>(emptyState);

  const rows = useMemo(() => tagsQuery.data || [], [tagsQuery.data]);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    setForm(emptyState);
    setShowModal(true);
  }

  function openEdit(tag: BlogTag) {
    setEditing(tag);
    setForm({
      name: tag.name,
      slug: tag.slug,
    });
    setShowModal(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...form });
        toast.success('Tag updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Tag created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyState);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Failed to save tag';
      toast.error(message);
    }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Tag deleted');
      setDeleteTarget(null);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Failed to delete tag';
      toast.error(message);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog Tags</h1>
              <p className="text-sm text-muted">Manage tags used across blog posts.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/blogs">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </div>
        </div>

        {tagsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Slug</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Posts</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rows.map((tag) => (
                    <tr key={tag.id}>
                      <td className="px-5 py-3.5 font-medium text-foreground">{tag.name}</td>
                      <td className="px-5 py-3.5 text-muted">{tag.slug}</td>
                      <td className="px-5 py-3.5 text-muted">{tag._count?.blogPosts ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(tag)}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-light hover:text-primary-dark"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(tag)}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-accent/10 hover:text-accent"
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
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Tag' : 'Create Tag'}>
        <form onSubmit={onSave} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            maxLength={FIELD_LIMITS.CATEGORY_NAME_EN}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
                slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
              }))
            }
            required
          />
          <Input label="Slug" value={form.slug} readOnly required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Tag">
        <p className="text-sm text-muted">
          Delete <strong className="text-foreground">{deleteTarget?.name}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="accent" onClick={onDelete} loading={deleteMutation.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
