'use client';

import { useState } from 'react';
import { Megaphone, Users, Calendar, ChevronRight, Info, Star, Trophy } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useCampaigns } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const HOW_IT_WORKS = [
  { icon: Star, title: 'Browse & Join', desc: 'Find an active campaign and click "Join Campaign" on its detail page.' },
  { icon: Megaphone, title: 'Write Reviews', desc: 'Visit businesses in the campaign category and submit honest reviews.' },
  { icon: Trophy, title: 'Climb Leaderboard', desc: 'Your reviews count toward the community goal. Top contributors get recognition.' },
];

const STATUS_TABS = ['active', 'all', 'ended'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>{value.toLocaleString()} participants joined</span>
        <span className="font-medium text-primary">{pct}% of goal</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const { isAuthenticated } = useAuth();
  const [statusTab, setStatusTab] = useState<StatusTab>('active');
  const { data: campaigns, isLoading } = useCampaigns(
    statusTab === 'all' ? undefined : { status: statusTab },
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Campaigns</h1>
          <p className="mt-2 text-muted">Join community campaigns and help improve transparency across Pakistan</p>
        </div>

        {/* How it Works */}
        <Card>
          <CardContent className="py-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" />
              How Campaigns Work
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-surface p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
            {!isAuthenticated && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary-dark">
                <Link href="/auth/login" className="font-semibold underline">Login</Link>{' '}
                to join campaigns and track your contribution on the leaderboard.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                statusTab === tab
                  ? 'bg-primary text-white'
                  : 'border border-border bg-surface text-muted hover:border-primary/40 hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaign List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : !campaigns?.length ? (
          <EmptyState
            title={statusTab === 'active' ? 'No active campaigns right now' : 'No campaigns found'}
            description={statusTab === 'active' ? 'Check back soon — new campaigns launch regularly.' : 'Try a different filter.'}
          />
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const participants = campaign._count?.participants ?? 0;
              const isEnded = campaign.status === 'ended';
              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className={`transition-shadow hover:shadow-md ${isEnded ? 'opacity-70' : ''}`}>
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {/* Title row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Megaphone className={`h-5 w-5 flex-shrink-0 ${isEnded ? 'text-muted' : 'text-primary'}`} />
                            <h2 className="truncate text-base font-semibold text-foreground">{campaign.title}</h2>
                            <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                              {campaign.status}
                            </Badge>
                            {campaign.categoryKey && (
                              <Badge>{campaign.categoryKey}</Badge>
                            )}
                          </div>

                          {campaign.description && (
                            <p className="mt-2 text-sm text-muted line-clamp-2">{campaign.description}</p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {participants.toLocaleString()} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Ends {new Date(campaign.endsAt).toLocaleDateString()}
                            </span>
                          </div>

                          <ProgressBar value={participants} max={campaign.targetGoal} />
                        </div>

                        <div className="flex flex-shrink-0 flex-col items-end gap-2">
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">{campaign.targetGoal}</span>
                            <p className="text-xs text-muted">goal</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
