"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, CheckCircle2, Clock3, Scale, EyeOff, Trash2 } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import {
  useModerationCases,
  useModerationStats,
  useResolveModerationCase,
  type ModerationCaseItem,
} from '@/hooks/use-api';
import { cn, formatRelativeTime } from '@/lib/utils';

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'green' | 'amber' | 'blue' | 'slate';
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-800 ring-amber-200'
        : tone === 'blue'
          ? 'bg-sky-50 text-sky-800 ring-sky-200'
          : 'bg-slate-50 text-slate-800 ring-slate-200';

  return (
    <div className={cn('rounded-xl p-4 ring-1', toneClass)}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CaseActions({ item }: { item: ModerationCaseItem }) {
  const resolve = useResolveModerationCase();
  const [busy, setBusy] = useState(false);

  const run = async (actionType: 'keep' | 'hide_review' | 'remove_review' | 'close_case') => {
    setBusy(true);
    try {
      await resolve.mutateAsync({ caseId: item.id, actionType });
    } finally {
      setBusy(false);
    }
  };

  if (item.status === 'resolved' || item.status === 'closed') {
    return <span className="text-xs font-medium text-muted">Resolved</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        disabled={busy}
        onClick={() => run('keep')}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Keep
      </button>
      <button
        disabled={busy}
        onClick={() => run('hide_review')}
        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
      >
        <EyeOff className="h-3.5 w-3.5" /> Hide
      </button>
      <button
        disabled={busy}
        onClick={() => run('remove_review')}
        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
      >
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>
  );
}

export default function CommunityModerationPage() {
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState<string>('open');

  const canModerate = useMemo(
    () => ['admin', 'super_admin', 'moderator'].includes(user?.role || ''),
    [user?.role],
  );

  const statsQuery = useModerationStats();
  const casesQuery = useModerationCases({ page: 1, pageSize: 20, ...(status ? { status } : {}) });

  if (!isAuthenticated || !canModerate) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-14">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-7 w-7 text-amber-600" />
            <h1 className="mt-3 text-xl font-semibold text-amber-900">Moderator access required</h1>
            <p className="mt-1 text-sm text-amber-800">
              This page is restricted to moderation roles.
            </p>
            <div className="mt-4">
              <Link href="/community" className="text-sm font-semibold text-primary hover:underline">
                Back to community
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const stats = statsQuery.data;
  const rows = casesQuery.data?.data ?? [];

  return (
    <PublicLayout>
      <div className="relative min-h-screen overflow-hidden bg-surface">
        <div className="blob-green absolute -top-24 -right-12 h-72 w-72 opacity-20" />
        <div className="blob-orange absolute bottom-16 -left-10 h-52 w-52 opacity-15" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
                  <Shield className="h-3.5 w-3.5" />
                  Community Moderation Center
                </div>
                <h1 className="mt-3 text-2xl font-bold text-foreground">Trust and Policy Operations</h1>
                <p className="mt-1 text-sm text-muted">
                  Review active moderation queue and transparency metrics.
                </p>
              </div>
              <Link href="/review-policy" className="text-sm font-semibold text-primary hover:underline">
                Policy guide
              </Link>
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Open Cases" value={stats?.cases.open ?? 0} tone="amber" />
            <StatCard label="In Progress" value={stats?.cases.inProgress ?? 0} tone="blue" />
            <StatCard label="Resolved" value={stats?.cases.resolved ?? 0} tone="green" />
            <StatCard label="Reports Open" value={stats?.reports.open ?? 0} tone="slate" />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Scale className="h-4 w-4" />
              <span>Queue status</span>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="rounded-2xl border border-border bg-white shadow-sm">
            {casesQuery.isLoading ? (
              <div className="p-6 text-sm text-muted">Loading moderation queue...</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">No moderation cases found.</div>
            ) : (
              <div className="divide-y divide-border">
                {rows.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">Case {item.id.slice(0, 8)}</p>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mb-3 grid gap-2 text-xs text-muted sm:grid-cols-4">
                      <p><span className="font-medium text-foreground">Object:</span> {item.objectType}</p>
                      <p><span className="font-medium text-foreground">Trigger:</span> {item.triggerType}</p>
                      <p><span className="font-medium text-foreground">Severity:</span> {item.severity}</p>
                      <p className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatRelativeTime(item.openedAt)}</p>
                    </div>
                    <CaseActions item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
