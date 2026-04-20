'use client';

import { Clock, CheckCircle, MessageSquare } from 'lucide-react';
import type { ResponseMetrics } from '@/types';

export function ResponseMetricsBar({ metrics }: { metrics: ResponseMetrics | undefined }) {
  if (!metrics) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-white px-4 py-3 text-sm">
      <div className="flex items-center gap-1.5 text-muted">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span>
          Response rate:{' '}
          <span className="font-semibold text-foreground">{Math.round(metrics.responseRate)}%</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-muted">
        <Clock className="h-4 w-4 text-amber-500" />
        <span>
          Avg response:{' '}
          <span className="font-semibold text-foreground">
            {metrics.avgResponseTimeHours < 1
              ? '<1 hr'
              : `${Math.round(metrics.avgResponseTimeHours)} hrs`}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-muted">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>
          Issues resolved:{' '}
          <span className="font-semibold text-foreground">{metrics.issuesResolvedCount}</span>
        </span>
      </div>
    </div>
  );
}
