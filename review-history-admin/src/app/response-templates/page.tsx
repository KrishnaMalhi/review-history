'use client';

import { useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Button, Badge, Input, Skeleton, Modal } from '@/components/ui';
import {
  useAdminResponseTemplates,
  useCreateResponseTemplate,
  useUpdateResponseTemplate,
  useDeleteResponseTemplate,
} from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

interface TemplateForm {
  titleEn: string;
  bodyEn: string;
  categoryKey: string;
  sentiment: string;
}

const emptyForm: TemplateForm = { titleEn: '', bodyEn: '', categoryKey: '', sentiment: 'neutral' };

export default function ResponseTemplatesPage() {
  const { data: templates, isLoading } = useAdminResponseTemplates();
  const createMut = useCreateResponseTemplate();
  const updateMut = useUpdateResponseTemplate();
  const deleteMut = useDeleteResponseTemplate();
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(tpl: any) {
    setEditingId(tpl.id);
    setForm({
      titleEn: tpl.titleEn,
      bodyEn: tpl.bodyEn,
      categoryKey: tpl.categoryKey ?? '',
      sentiment: tpl.sentiment ?? 'neutral',
    });
    setShowModal(true);
  }

  const handleSave = () => {
    if (editingId) {
      const data = {
        titleEn: form.titleEn,
        bodyEn: form.bodyEn,
        categoryKey: form.categoryKey || undefined,
        sentiment: form.sentiment,
      };
      updateMut.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => { toast.success('Template updated'); setShowModal(false); },
          onError: () => toast.error('Failed to update template'),
        },
      );
    } else {
      const data = {
        titleEn: form.titleEn,
        bodyEn: form.bodyEn,
        categoryKey: form.categoryKey || undefined,
        sentiment: form.sentiment,
      };
      createMut.mutate(data, {
        onSuccess: () => { toast.success('Template created'); setShowModal(false); setForm(emptyForm); },
        onError: () => toast.error('Failed to create template'),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => { toast.success('Template deleted'); setDeleteTarget(null); },
      onError: () => toast.error('Failed to delete template'),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Response Templates</h1>
            <p className="text-sm text-muted">Pre-built reply templates for entity owners</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> New Template
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : !templates?.length ? (
          <Card className="p-8 text-center text-muted">No templates yet</Card>
        ) : (
          <div className="space-y-3">
            {templates.map((tpl: any) => (
              <Card key={tpl.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{tpl.titleEn}</span>
                      {tpl.categoryKey && <Badge>{tpl.categoryKey}</Badge>}
                      {tpl.sentiment && <Badge variant="info">{tpl.sentiment}</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-muted line-clamp-2">{tpl.bodyEn}</p>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button onClick={() => openEdit(tpl)} className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(tpl.id)} className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Template' : 'Create Template'}>
        <div className="space-y-4">
          <Input
            label="Template Title"
            value={form.titleEn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, titleEn: e.target.value })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Body</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={5}
              value={form.bodyEn}
              onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
            />
          </div>
          <Input
            label="Category Key (optional)"
            value={form.categoryKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, categoryKey: e.target.value })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sentiment</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface"
              value={form.sentiment}
              onChange={(e) => setForm({ ...form, sentiment: e.target.value })}
            >
              <option value="positive">positive</option>
              <option value="neutral">neutral</option>
              <option value="negative">negative</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              loading={createMut.isPending || updateMut.isPending}
              onClick={handleSave}
              disabled={!form.titleEn.trim() || !form.bodyEn.trim() || (!editingId && !form.sentiment.trim())}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template">
        <p className="text-sm text-muted">Are you sure you want to delete this template?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteTarget && handleDelete(deleteTarget)}>
            Delete
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
