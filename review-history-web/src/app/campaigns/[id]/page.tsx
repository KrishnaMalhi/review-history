'use client';

import { use } from 'react';
import { Megaphone, Users, Calendar, Trophy, CheckCircle2, Search, Star, ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState } from '@/components/ui';
import { useCampaign, useCampaignLeaderboard, useJoinCampaign } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';
import Link from 'next/link';

const PARTICIPATION_STEPS = [
  { icon: Search, label: 'Find a business', desc: 'Search for businesses in this campaign\'s category.' },
  { icon: Star, label: 'Write a review', desc: 'Share an honest, detailed experience on the entity\'s page.' },
  { icon: CheckCircle2, label: 'Your review counts', desc: 'Every approved review moves the community closer to the goal.' },
];

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted">{value.toLocaleString()} participants joined</span>
        <span className="font-semibold text-primary">{pct}% of goal ({max})</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

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
          <Skeleton className="h-52 w-full" />
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

  const participants = campaign._count?.participants ?? 0;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">

        {/* Campaign header card */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-wrap items-center gap-3">
              <Megaphone className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
              <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                {campaign.status}
              </Badge>
              {campaign.categoryKey && <Badge variant="info">{campaign.categoryKey}</Badge>}
            </div>

            {campaign.description && (
              <p className="mt-4 leading-relaxed text-muted">{campaign.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {participants.toLocaleString()} participants
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(campaign.startsAt).toLocaleDateString()} — {new Date(campaign.endsAt).toLocaleDateString()}
              </span>
            </div>

            {/* Progress bar */}
            <ProgressBar value={participants} max={campaign.targetGoal} />

            {/* Join CTA */}
            {isAuthenticated && campaign.status === 'active' && (
              <Button
                className="mt-5"
                loading={joinMut.isPending}
                onClick={() =>
                  joinMut.mutate(id, {
                    onSuccess: () => toast.success('You joined the campaign! Start writing reviews.'),
                    onError: () => toast.error('Could not join — you may have already joined.'),
                  })
                }
              >
                Join Campaign
              </Button>
            )}
            {!isAuthenticated && (
              <div className="mt-5">
                <Link href="/auth/login">
                  <Button variant="outline">Login to Join</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Participate */}
        {campaign.status === 'active' && (
          <Card>
            <CardContent className="py-5">
              <h2 className="mb-4 text-base font-semibold text-foreground">How to Participate</h2>
              <div className="space-y-4">
                {PARTICIPATION_STEPS.map(({ icon: Icon, label, desc }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="mr-1 font-bold text-primary">Step {i + 1}.</span>
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {campaign.categoryKey && (
                <Link
                  href={`/search?category=${campaign.categoryKey}`}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Find {campaign.categoryKey} businesses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" />
            Campaign Leaderboard
          </h2>
          {!leaderboard?.length ? (
            <Card className="p-6 text-center text-muted">No participants yet — be the first to join!</Card>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: any, idx: number) => (
                <Card key={entry.userId ?? idx}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-700'
                            : idx === 1
                            ? 'bg-slate-100 text-slate-600'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-border text-muted'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-medium text-foreground">{entry.displayName ?? 'User'}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {entry.reviewCount ?? 0} review{(entry.reviewCount ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
