'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, CheckCircle, XCircle, User, Building2, Clock, FileText } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useAdminClaimDetail, useAdminResolveClaim } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: claim, isLoading } = useAdminClaimDetail(id);
  const resolveClaim = useAdminResolveClaim();
  const toast = useToast();

  const handleAction = (action: 'approve' | 'reject') => {
    resolveClaim.mutate(
      { claimId: id, action },
      {
        onSuccess: () => toast.success(`Claim ${action}d successfully`),
        onError: () => toast.error('Failed to update claim'),
      },
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!claim) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Landmark className="mx-auto h-10 w-10 text-muted/40" />
          <p className="mt-3 text-muted">Claim not found.</p>
          <Link href="/claims" className="mt-4 inline-block text-sm text-primary hover:underline">
            Back to Claims
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/claims"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted hover:bg-surface hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-navy shadow-md shadow-navy/20">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Claim Details</h1>
            <p className="text-sm text-muted">ID: {claim.id.slice(0, 8)}...</p>
          </div>
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Entity Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Entity Information</h2>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Entity Name</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{claim.entityName}</dd>
              </div>
              {claim.entity?.category && (
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Category</dt>
                  <dd className="mt-1 text-sm text-foreground">{claim.entity.category.nameEn}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Entity ID</dt>
                <dd className="mt-1 text-xs font-mono text-muted">{claim.entityId}</dd>
              </div>
            </dl>
          </Card>

          {/* Requester Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Requester Information</h2>
            </div>
            {claim.requester ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Name</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {claim.requester.displayName || 'No display name'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Phone</dt>
                  <dd className="mt-1 text-sm text-foreground">{claim.requester.phoneE164}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Role</dt>
                  <dd className="mt-1">
                    <Badge variant="default">{claim.requester.role}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Joined</dt>
                  <dd className="mt-1 text-sm text-muted">
                    {new Date(claim.requester.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted">Requester information unavailable</p>
            )}
          </Card>

          {/* Claim Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Claim Details</h2>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Claim Type</dt>
                <dd className="mt-1 text-sm text-foreground capitalize">{claim.claimType}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Verification Method</dt>
                <dd className="mt-1 text-sm text-foreground">{claim.verificationMethod}</dd>
              </div>
              {claim.submittedDocumentsJson && (
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Submitted Evidence</dt>
                  <dd className="mt-1 text-sm text-foreground break-all">
                    {typeof claim.submittedDocumentsJson === 'object'
                      ? JSON.stringify(claim.submittedDocumentsJson, null, 2)
                      : String(claim.submittedDocumentsJson)}
                  </dd>
                </div>
              )}
              {claim.adminNotes && (
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Admin Notes</dt>
                  <dd className="mt-1 text-sm text-foreground">{claim.adminNotes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Timeline</h2>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Submitted</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(claim.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Last Updated</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(claim.updatedAt).toLocaleString()}
                </dd>
              </div>
              {claim.approvedAt && (
                <div>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Resolved At</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date(claim.approvedAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        {/* Action Buttons */}
        {claim.status === 'pending' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('approve')}
                disabled={resolveClaim.isPending}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="h-4 w-4" /> Approve Claim
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={resolveClaim.isPending}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-4 w-4" /> Reject Claim
              </button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
