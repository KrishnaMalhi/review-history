'use client';

import { use, useState } from 'react';
import { BarChart3, Mail, Copy, FileText, Clock, Users, Eye, TrendingUp } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState, Input } from '@/components/ui';
import {
  useEntity, useEntityAnalytics, useResponseMetrics, useReviewInvites,
  useCreateInvite, useResponseTemplates,
} from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';
import { ResponseMetricsBar } from '@/components/shared/response-metrics-bar';

export default function OwnerDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { data: entity, isLoading: entityLoading } = useEntity(id);
  const { data: analytics, isLoading: analyticsLoading } = useEntityAnalytics(id);
  const { data: metrics } = useResponseMetrics(id);
  const { data: invites, isLoading: invitesLoading } = useReviewInvites(id);
  const { data: templates } = useResponseTemplates();
  const createInvite = useCreateInvite();
  const toast = useToast();
  const [inviteNote, setInviteNote] = useState('');

  if (entityLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="h-60 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!entity) {
    return (
      <PublicLayout>
        <EmptyState title="Entity not found" description="This entity does not exist." />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Owner Dashboard — {entity.name}</h1>
          <p className="mt-1 text-sm text-muted">Manage your listing, track performance, and invite reviews</p>
        </div>

        {/* Response Metrics */}
        <ResponseMetricsBar metrics={metrics} />

        {/* Analytics Overview */}
        <Card>
          <CardContent className="py-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" /> Analytics
            </h2>
            {analyticsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon={Eye} label="Page Views" value={analytics.totalViews ?? 0} />
                <StatCard icon={Users} label="Unique Visitors" value={analytics.uniqueVisitors ?? 0} />
                <StatCard icon={TrendingUp} label="Reviews (30d)" value={analytics.recentReviews ?? 0} />
                <StatCard icon={Clock} label="Avg Response" value={`${Math.round(metrics?.avgResponseTimeHours ?? 0)}h`} />
              </div>
            ) : (
              <p className="text-sm text-muted">Analytics data will appear once your listing gets traffic.</p>
            )}
          </CardContent>
        </Card>

        {/* Review Invites */}
        <Card>
          <CardContent className="py-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Mail className="h-5 w-5 text-primary" /> Review Invites
            </h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Optional note for the invite..."
                value={inviteNote}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteNote(e.target.value)}
                className="flex-1"
              />
              <Button
                loading={createInvite.isPending}
                onClick={() =>
                  createInvite.mutate(
                    { entityId: id, data: { note: inviteNote || undefined } },
                    {
                      onSuccess: () => { toast.success('Invite created!'); setInviteNote(''); },
                      onError: () => toast.error('Failed to create invite'),
                    },
                  )
                }
              >
                Create Invite Link
              </Button>
            </div>

            {invitesLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : !invites?.length ? (
              <p className="text-sm text-muted">No invites created yet</p>
            ) : (
              <div className="space-y-2">
                {invites.map((invite: any) => (
                  <div key={invite.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div>
                      <span className="font-mono text-xs text-muted">{invite.token}</span>
                      <Badge className="ml-2" variant={invite.status === 'active' ? 'success' : 'default'}>
                        {invite.status}
                      </Badge>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/r/${invite.token}`);
                        toast.success('Link copied!');
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Templates */}
        <Card>
          <CardContent className="py-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" /> Response Templates
            </h2>
            {!templates?.length ? (
              <p className="text-sm text-muted">No templates available. Admins create templates for your category.</p>
            ) : (
              <div className="space-y-3">
                {templates.map((tpl: any) => (
                  <div key={tpl.id} className="rounded-lg border border-border p-3">
                    <h3 className="text-sm font-medium text-foreground">{tpl.name}</h3>
                    <p className="mt-1 text-sm text-muted">{tpl.body}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tpl.body);
                        toast.success('Template copied!');
                      }}
                      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
