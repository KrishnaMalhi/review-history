'use client';

import { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useAdminModerationCases, useResolveModerationCase } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const severityColors: Record<string, string> = {
  low: 'bg-surface text-muted ring-1 ring-border/50',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  high: 'bg-accent-light text-accent-dark ring-1 ring-accent/20',
  critical: 'bg-red-50 text-red-700 ring-1 ring-red-200/50',
};

export default function ModerationPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminModerationCases({ page, pageSize: 20 });
  const toast = useToast();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent shadow-md shadow-accent/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Moderation Queue</h1>
            <p className="text-sm text-muted">Review and resolve flagged content</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="p-12 text-center">
            <Shield className="mx-auto h-10 w-10 text-primary/40" />
            <p className="mt-3 text-muted">No open moderation cases. All clear!</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((c) => (
                <CaseRow
                  key={c.id}
                  caseItem={c}
                  toast={toast}
                  severityColors={severityColors}
                />
              ))}
            </div>

            {data.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function CaseRow({
  caseItem,
  toast,
  severityColors,
}: {
  caseItem: { id: string; type: string; status: string; severity: string; description: string; openedAt: string };
  toast: ReturnType<typeof useToast>;
  severityColors: Record<string, string>;
}) {
  const resolve = useResolveModerationCase(caseItem.id);

  const handleResolve = (actionType: string) => {
    resolve.mutate(
      { actionType },
      {
        onSuccess: () => toast.success('Case updated successfully'),
        onError: () => toast.error('Failed to resolve case'),
      },
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="text-sm font-medium text-gray-900">{caseItem.type}</span>
            <span className={cn('rounded px-2 py-0.5 text-xs font-medium', severityColors[caseItem.severity] ?? severityColors.low)}>
              {caseItem.severity}
            </span>
            <Badge variant={caseItem.status === 'open' ? 'warning' : caseItem.status === 'resolved' ? 'success' : 'default'}>
              {caseItem.status}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">{caseItem.description}</p>
          <p className="mt-1 text-xs text-gray-400">
            Opened: {new Date(caseItem.openedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/moderation/${caseItem.id}`}
            className="rounded-lg bg-primary-light px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
          >
            View
          </Link>
          <button
            onClick={() => handleResolve('keep')}
            disabled={resolve.isPending || caseItem.status === 'resolved' || caseItem.status === 'closed'}
            className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            Keep
          </button>
          <button
            onClick={() => handleResolve('close_case')}
            disabled={resolve.isPending || caseItem.status === 'resolved' || caseItem.status === 'closed'}
            className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </Card>
  );
}
