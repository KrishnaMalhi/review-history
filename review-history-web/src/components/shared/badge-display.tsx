'use client';

import { Award, Flame, Star, Shield, Heart, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeType, UserBadge, EntityBadge } from '@/types';

const badgeConfig: Record<BadgeType, { label: string; icon: typeof Award; color: string }> = {
  first_review: { label: 'First Review', icon: Star, color: 'text-blue-600 bg-blue-50' },
  five_reviews: { label: '5 Reviews', icon: Star, color: 'text-blue-600 bg-blue-50' },
  ten_reviews: { label: '10 Reviews', icon: Star, color: 'text-indigo-600 bg-indigo-50' },
  fifty_reviews: { label: '50 Reviews', icon: Trophy, color: 'text-purple-600 bg-purple-50' },
  streak_7: { label: '7-Day Streak', icon: Flame, color: 'text-orange-600 bg-orange-50' },
  streak_30: { label: '30-Day Streak', icon: Flame, color: 'text-red-600 bg-red-50' },
  community_helper: { label: 'Community Helper', icon: Heart, color: 'text-pink-600 bg-pink-50' },
  verified_reviewer: { label: 'Verified Reviewer', icon: Shield, color: 'text-green-600 bg-green-50' },
  quality_reviewer: { label: 'Quality Reviewer', icon: Award, color: 'text-emerald-600 bg-emerald-50' },
  top_contributor: { label: 'Top Contributor', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
  employee_trusted: { label: 'Employee Trusted', icon: Shield, color: 'text-teal-600 bg-teal-50' },
  fast_responder: { label: 'Fast Responder', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
  responsive_employer: { label: 'Responsive Employer', icon: Zap, color: 'text-cyan-600 bg-cyan-50' },
  school_rated: { label: 'School Rated', icon: Award, color: 'text-violet-600 bg-violet-50' },
  doctor_rated: { label: 'Doctor Rated', icon: Award, color: 'text-sky-600 bg-sky-50' },
  product_rated: { label: 'Product Rated', icon: Award, color: 'text-lime-600 bg-lime-50' },
  highly_rated: { label: 'Highly Rated', icon: Star, color: 'text-amber-600 bg-amber-50' },
};

function BadgePill({ badgeType, className }: { badgeType: BadgeType; className?: string }) {
  const config = badgeConfig[badgeType] ?? { label: badgeType, icon: Award, color: 'text-gray-600 bg-gray-50' };
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-current/10',
        config.color,
        className,
      )}
      title={config.label}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function UserBadgeDisplay({ badges, max = 5 }: { badges: UserBadge[]; max?: number }) {
  if (!badges?.length) return null;
  const shown = badges.slice(0, max);
  const remaining = badges.length - max;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((b) => (
        <BadgePill key={b.id} badgeType={b.badgeType} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

export function EntityBadgeDisplay({ badges, max = 5 }: { badges: EntityBadge[]; max?: number }) {
  if (!badges?.length) return null;
  const shown = badges.slice(0, max);
  const remaining = badges.length - max;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((b) => (
        <BadgePill key={b.id} badgeType={b.badgeType} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
