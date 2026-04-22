'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { useAdminCampaign } from '@/hooks/use-api';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const { data: campaign, isLoading } = useAdminCampaign(id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign Details</h1>
            <p className="text-sm text-muted">View campaign status and progress context</p>
          </div>
          <Link href="/campaigns">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : !campaign ? (
          <Card className="p-8 text-center text-muted">Campaign not found</Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{campaign.title}</h2>
                <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'ended' ? 'default' : 'warning'}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted">{campaign.description || 'No description provided'}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Category Key" value={campaign.categoryKey || '-'} />
                <InfoItem label="Target Goal" value={campaign.targetGoal} />
                <InfoItem label="Participants" value={campaign._count?.participants ?? 0} />
                <InfoItem label="Created" value={new Date(campaign.createdAt).toLocaleString()} />
                <InfoItem label="Starts At" value={new Date(campaign.startsAt).toLocaleString()} />
                <InfoItem label="Ends At" value={new Date(campaign.endsAt).toLocaleString()} />
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

