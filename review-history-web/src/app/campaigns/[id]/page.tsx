'use client';

import { use } from 'react';
import { Megaphone, Users, Calendar, Trophy } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState } from '@/components/ui';
import { useCampaign, useCampaignLeaderboard, useJoinCampaign } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const { data: campaign, isLoading } = useCampaign(id);
  const { data: leaderboard } = useCampaignLeaderboard(id);
  const joinMut = useJoinCampaign();
  const toast = useToast();

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!campaign) {
    return (
      <PublicLayout>
        <EmptyState title="Campaign not found" description="This campaign may have ended or been removed." />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
              <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                {campaign.status}
              </Badge>
            </div>

            {campaign.description && (
              <p className="mt-4 text-muted leading-relaxed">{campaign.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {campaign._count?.participants ?? 0} participants
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(campaign.startsAt).toLocaleDateString()} — {new Date(campaign.endsAt).toLocaleDateString()}
              </span>
              <span>Goal: <strong className="text-foreground">{campaign.targetGoal} reviews</strong></span>
            </div>

            {isAuthenticated && campaign.status === 'active' && (
              <Button
                className="mt-6"
                loading={joinMut.isPending}
                onClick={() =>
                  joinMut.mutate(id, {
                    onSuccess: () => toast.success('Joined campaign!'),
                    onError: () => toast.error('Could not join campaign'),
                  })
                }
              >
                Join Campaign
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" />
            Campaign Leaderboard
          </h2>
          {!leaderboard?.length ? (
            <Card className="p-6 text-center text-muted">No participants yet — be the first!</Card>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: any, idx: number) => (
                <Card key={entry.userId ?? idx} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{entry.displayName ?? 'User'}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {entry.reviewCount ?? 0} reviews
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
