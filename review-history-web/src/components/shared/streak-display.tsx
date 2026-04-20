'use client';

import { Flame } from 'lucide-react';
import type { ReviewStreak } from '@/types';

export function StreakDisplay({ streak }: { streak: ReviewStreak | undefined }) {
  if (!streak || streak.currentStreak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 ring-1 ring-orange-200/50">
      <Flame className="h-4 w-4 fill-orange-400" />
      {streak.currentStreak}-day streak
      {streak.longestStreak > streak.currentStreak && (
        <span className="text-xs text-orange-500"> (best: {streak.longestStreak})</span>
      )}
    </div>
  );
}
