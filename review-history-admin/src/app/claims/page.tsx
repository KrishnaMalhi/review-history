'use client';

import { useState } from 'react';
import { Landmark, CheckCircle, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useAdminClaims, useAdminResolveClaim } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

export default function AdminClaimsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminClaims({ page, pageSize: 20 });
  const resolveClaim = useAdminResolveClaim();
  const toast = useToast();

  const handleAction = (claimId: string, action: 'approve' | 'reject') => {
    resolveClaim.mutate(
      { claimId, action },
      {
        onSuccess: () => toast.success(`Claim ${action}d successfully`),
        onError: () => toast.error('Failed to update claim'),
      },
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-navy shadow-md shadow-navy/20">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entity Claims</h1>
            <p className="text-sm text-muted">Review and process ownership claims</p>
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
            <Landmark className="mx-auto h-10 w-10 text-muted/40" />
            <p className="mt-3 text-muted">No pending ownership claims.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((claim) => (
                <Card key={claim.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {claim.entityName}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                        <span>Method: {claim.verificationMethod}</span>
                        <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                        <Badge
                          variant={
                            claim.status === 'approved'
                              ? 'success'
                              : claim.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {claim.status}
                        </Badge>
                      </div>
                    </div>
                    {claim.status === 'pending' && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleAction(claim.id, 'approve')}
                          disabled={resolveClaim.isPending}
                          className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, 'reject')}
                          disabled={resolveClaim.isPending}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
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
