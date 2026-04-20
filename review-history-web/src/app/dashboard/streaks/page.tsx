'use client';

import { Flame, Trophy } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton, Card } from '@/components/ui';
import { useMyStreak, useStreakLeaderboard } from '@/hooks/use-api';
import { StreakDisplay } from '@/components/shared/streak-display';

export default function StreaksPage() {
  const { data: streak, isLoading: streakLoading } = useMyStreak();
  const { data: leaderboard, isLoading: lbLoading } = useStreakLeaderboard();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Streaks</h1>
          <p className="mt-1 text-sm text-gray-500">Stay consistent and climb the leaderboard</p>
        </div>

        {/* My Streak */}
        {streakLoading ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : (
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Flame className="h-10 w-10 text-orange-500" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Streak</h2>
                {streak && streak.currentStreak > 0 ? (
                  <StreakDisplay streak={streak} />
                ) : (
                  <p className="text-sm text-muted">No active streak. Write a review today to start!</p>
                )}
                {streak?.longestStreak ? (
                  <p className="mt-1 text-xs text-muted">Personal best: {streak.longestStreak} days</p>
                ) : null}
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" />
            Streak Leaderboard
          </h2>
          {lbLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : !leaderboard?.length ? (
            <Card className="p-6 text-center text-muted">No leaderboard data yet</Card>
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
                  <span className="text-sm font-semibold text-orange-600">
                    {entry.currentStreak ?? entry.longestStreak ?? 0} days
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
