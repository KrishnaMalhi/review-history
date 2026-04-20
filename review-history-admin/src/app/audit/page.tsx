'use client';

import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Skeleton } from '@/components/ui';
import { useAdminAuditLogs } from '@/hooks/use-api';

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAuditLogs({ page, pageSize: 30 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-md shadow-purple-500/20">
            <ScrollText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-sm text-muted">Track all admin actions and changes</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="p-12 text-center">
            <ScrollText className="mx-auto h-10 w-10 text-muted/40" />
            <p className="mt-3 text-muted">No audit logs yet.</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Timestamp</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Actor</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Action</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Object</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {data.data.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap px-5 py-3.5 text-muted">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted">
                          {log.actorId.slice(0, 8)}...
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted">
                          {log.objectType}:{log.objectId.slice(0, 8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {data.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl px-3.5 py-1.5 text-sm font-medium text-muted hover:bg-primary-light hover:text-primary-dark disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="rounded-xl px-3.5 py-1.5 text-sm font-medium text-muted hover:bg-primary-light hover:text-primary-dark disabled:opacity-40"
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
