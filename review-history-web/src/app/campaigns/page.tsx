'use client';

import { Megaphone, Users, Calendar } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState } from '@/components/ui';
import { useCampaigns } from '@/hooks/use-api';
import Link from 'next/link';

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns({ status: 'active' });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Review Campaigns</h1>
          <p className="mt-2 text-muted">Join community campaigns and help improve transparency</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : !campaigns?.length ? (
          <EmptyState title="No active campaigns" description="Check back soon for new campaigns." />
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-semibold text-foreground">{campaign.title}</h2>
                          <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        {campaign.description && (
                          <p className="mt-2 text-sm text-muted line-clamp-2">{campaign.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {campaign._count?.participants ?? 0} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Ends {new Date(campaign.endsAt).toLocaleDateString()}
                          </span>
                          {campaign.categoryKey && (
                            <Badge>{campaign.categoryKey}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">{campaign.targetGoal}</span>
                        <p className="text-xs text-muted">goal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
