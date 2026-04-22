'use client';

import { useState } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, GripVertical, Tag } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Button, Badge, Input, Skeleton, Modal } from '@/components/ui';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';
import { IconPicker, CategoryIcon } from '@/components/shared/icon-picker';
import type { Category } from '@/types';
import { FIELD_LIMITS } from '@shared/field-limits';

interface CategoryForm {
  key: string;
  nameEn: string;
  nameUr: string;
  icon: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: CategoryForm = { key: '', nameEn: '', nameUr: '', icon: 'Tag', description: '', isActive: true, sortOrder: 0 };

export default function CategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      key: cat.key,
      nameEn: cat.nameEn,
      nameUr: cat.nameUr,
      icon: cat.icon || 'Tag',
      description: cat.description || '',
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...form });
        toast.success('Category updated');
      } else {
        await createMut.mutateAsync(form);
        toast.success('Category created');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete');
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await updateMut.mutateAsync({ id: cat.id, isActive: !cat.isActive });
      toast.success(cat.isActive ? 'Category deactivated' : 'Category activated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Categories</h1>
              <p className="text-sm text-muted">Manage review categories and their settings</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !categories?.length ? (
          <Card className="p-12 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-muted/40" />
            <p className="mt-3 text-muted">No categories yet. Create your first one!</p>
            <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Order</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Icon</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Key</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name (EN)</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name (UR)</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">Tags</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">Entities</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-muted">
                          <GripVertical className="h-3.5 w-3.5" />
                          {cat.sortOrder}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                          <CategoryIcon name={cat.icon || 'Tag'} className="h-4.5 w-4.5 text-primary-dark" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">
                          {cat.key}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{cat.nameEn}</td>
                      <td className="px-5 py-3.5 text-muted" dir="rtl">{cat.nameUr}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-muted">
                          <Tag className="h-3 w-3" />
                          {cat._count?.warningTags ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-muted">
                        {cat._count?.entities ?? 0}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button onClick={() => toggleActive(cat)} title={cat.isActive ? 'Click to deactivate' : 'Click to activate'}>
                          <Badge variant={cat.isActive ? 'success' : 'default'}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary-dark transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="rounded-lg p-2 text-muted hover:bg-accent/10 hover:text-accent transition-colors"
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
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Key (slug)"
            placeholder="e.g. landlord"
            value={form.key}
            maxLength={FIELD_LIMITS.CATEGORY_KEY}
            onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
            required
            disabled={!!editingId}
          />
          <Input
            label="Name (English)"
            placeholder="e.g. Landlord"
            value={form.nameEn}
            maxLength={FIELD_LIMITS.CATEGORY_NAME_EN}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            required
          />
          <Input
            label="Name (Urdu)"
            placeholder="e.g. مالک مکان"
            value={form.nameUr}
            maxLength={FIELD_LIMITS.CATEGORY_NAME_UR}
            onChange={(e) => setForm({ ...form, nameUr: e.target.value })}
            required
            dir="rtl"
          />
          <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
          <Input
            label="Description"
            placeholder="e.g. Landlords and property owners"
            value={form.description}
            maxLength={FIELD_LIMITS.CATEGORY_DESCRIPTION}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Order"
              type="number"
              value={String(form.sortOrder)}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            />
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete <strong className="text-foreground">{deleteTarget?.nameEn}</strong>?
          {(deleteTarget?._count?.entities ?? 0) > 0 && (
            <span className="mt-1 block text-accent">
              This category has {deleteTarget?._count?.entities} entities. It will be deactivated instead of deleted.
            </span>
          )}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleDelete} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
