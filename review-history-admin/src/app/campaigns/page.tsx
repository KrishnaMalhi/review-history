'use client';

import { useState } from 'react';
import { Megaphone, Plus, Play, CheckCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Button, Badge, Input, Skeleton, Modal } from '@/components/ui';
import {
  useAdminCampaigns,
  useCreateCampaign,
  useActivateCampaign,
  useCompleteCampaign,
} from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

interface CampaignForm {
  title: string;
  description: string;
  categoryKey: string;
  targetGoal: number;
  startsAt: string;
  endsAt: string;
}

const emptyForm: CampaignForm = {
  title: '', description: '', categoryKey: '', targetGoal: 100,
  startsAt: new Date().toISOString().slice(0, 16),
  endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
};

export default function AdminCampaignsPage() {
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const createMut = useCreateCampaign();
  const activateMut = useActivateCampaign();
  const completeMut = useCompleteCampaign();
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CampaignForm>(emptyForm);

  const handleCreate = () => {
    createMut.mutate(
      {
        title: form.title,
        description: form.description || undefined,
        categoryKey: form.categoryKey || undefined,
        targetGoal: form.targetGoal,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      },
      {
        onSuccess: () => { toast.success('Campaign created'); setShowModal(false); setForm(emptyForm); },
        onError: () => toast.error('Failed to create campaign'),
      },
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-sm text-muted">Manage review campaigns</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setShowModal(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> New Campaign
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : !campaigns?.length ? (
          <Card className="p-8 text-center text-muted">No campaigns yet</Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <Card key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{c.title}</span>
                    <Badge variant={c.status === 'active' ? 'success' : c.status === 'ended' ? 'default' : 'warning'}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Goal: {c.targetGoal} &middot; Participants: {c._count?.participants ?? 0} &middot;
                    {new Date(c.startsAt).toLocaleDateString()} — {new Date(c.endsAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {c.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={activateMut.isPending}
                      onClick={() => activateMut.mutate(c.id, {
                        onSuccess: () => toast.success('Campaign activated'),
                        onError: () => toast.error('Failed to activate'),
                      })}
                    >
                      <Play className="mr-1 h-3 w-3" /> Activate
                    </Button>
                  )}
                  {c.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={completeMut.isPending}
                      onClick={() => completeMut.mutate(c.id, {
                        onSuccess: () => toast.success('Campaign ended'),
                        onError: () => toast.error('Failed to end campaign'),
                      })}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" /> End
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Campaign">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, description: e.target.value })} />
          <Input label="Category Key (optional)" value={form.categoryKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, categoryKey: e.target.value })} />
          <Input label="Target Goal" type="number" value={String(form.targetGoal)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, targetGoal: Number(e.target.value) })} />
          <Input label="Starts At" type="datetime-local" value={form.startsAt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, startsAt: e.target.value })} />
          <Input label="Ends At" type="datetime-local" value={form.endsAt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, endsAt: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={createMut.isPending} onClick={handleCreate} disabled={!form.title}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
