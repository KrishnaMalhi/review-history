'use client';

import Link from 'next/link';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useMyClaims } from '@/hooks/use-api';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { icon: React.ElementType; variant: 'default' | 'success' | 'danger' | 'warning'; label: string }> = {
  pending: { icon: Clock, variant: 'warning', label: 'Pending' },
  approved: { icon: CheckCircle, variant: 'success', label: 'Approved' },
  rejected: { icon: XCircle, variant: 'danger', label: 'Rejected' },
  revoked: { icon: AlertCircle, variant: 'default', label: 'Revoked' },
};

export default function MyClaimsPage() {
  const { data: claims, isLoading } = useMyClaims();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the status of your entity ownership claims
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Approved claim flow: open the entity owner dashboard to set up profile details and reply to reviews.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !claims?.length ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">You haven&apos;t submitted any ownership claims yet.</p>
            <p className="mt-2 text-xs text-gray-400">
              Search for your business and click &quot;Claim Ownership&quot; to get started.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const cfg = statusConfig[claim.status] ?? statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <Card key={claim.id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/entities/${claim.entityId}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {claim.entityName}
                      </Link>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                        <span>Method: {claim.verificationMethod}</span>
                        <span>
                          Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant={cfg.variant}>
                      <Icon className={cn('mr-1 h-3 w-3')} />
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/entities/${claim.entityId}`}
                      className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Open Entity Page
                    </Link>
                    {claim.status === 'approved' && (
                      <Link
                        href={`/entities/${claim.entityId}/owner-dashboard`}
                        className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                      >
                        Manage Profile & Replies
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
