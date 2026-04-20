'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton, Card } from '@/components/ui';
import { useUserBadges } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { UserBadgeDisplay } from '@/components/shared/badge-display';

export default function BadgesPage() {
  const { user } = useAuth();
  const { data: badges, isLoading } = useUserBadges(user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Badges</h1>
          <p className="mt-1 text-sm text-gray-500">Badges earned through your contributions</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !badges?.length ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No badges earned yet. Keep reviewing to earn badges!</p>
          </Card>
        ) : (
          <Card className="p-6">
            <UserBadgeDisplay badges={badges} max={50} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
