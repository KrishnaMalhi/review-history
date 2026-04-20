'use client';

import { use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { useAdminReview, useAdminUpdateReviewStatus } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

export default function AdminReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data, isLoading } = useAdminReview(id);
  const updateStatus = useAdminUpdateReviewStatus(id);

  const onStatus = (status: 'published' | 'hidden' | 'removed' | 'under_verification') => {
    updateStatus.mutate(status, {
      onSuccess: () => toast.success('Review status updated'),
      onError: () => toast.error('Failed to update review status'),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Detail</h1>
            <p className="text-sm text-muted">Review ID: {id}</p>
          </div>
          <Link href="/reviews" className="text-sm font-medium text-primary hover:underline">
            Back to Reviews
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !data ? (
          <Card className="p-8 text-center text-muted">Review not found.</Card>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{data.status}</Badge>
                <Badge variant="info">Rating {data.overallRating}</Badge>
                <Badge variant="warning">{data.moderationState}</Badge>
                <Badge variant="warning">{data.riskState}</Badge>
                <span className="text-xs text-muted">Created: {new Date(data.createdAt).toLocaleString()}</span>
              </div>

              <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p><span className="font-medium">Entity:</span> {data.entity?.displayName}</p>
                  <p><span className="font-medium">Category:</span> {data.entity?.category?.nameEn}</p>
                  <p><span className="font-medium">City:</span> {data.entity?.city?.nameEn}</p>
                </div>
                <div>
                  <p><span className="font-medium">Author:</span> {data.author?.displayName || 'Anonymous'}</p>
                  <p><span className="font-medium">Email:</span> {data.author?.email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {data.author?.phoneE164 || 'N/A'}</p>
                </div>
              </div>

              {data.title && <p className="mt-4 text-sm font-semibold text-foreground">{data.title}</p>}
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm text-foreground/85">{data.body}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onStatus('published')} disabled={updateStatus.isPending}>
                  Publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => onStatus('under_verification')} disabled={updateStatus.isPending}>
                  Under Verification
                </Button>
                <Button size="sm" variant="outline" onClick={() => onStatus('hidden')} disabled={updateStatus.isPending}>
                  Hide
                </Button>
                <Button size="sm" variant="danger" onClick={() => onStatus('removed')} disabled={updateStatus.isPending}>
                  Remove
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold text-foreground">Reports ({data.reports?.length || 0})</h2>
              <div className="mt-3 space-y-2">
                {(data.reports || []).length === 0 ? (
                  <p className="text-sm text-muted">No reports for this review.</p>
                ) : (
                  (data.reports || []).map((r: any) => (
                    <div key={r.id} className="rounded-lg border border-border p-3 text-sm">
                      <p><span className="font-medium">{r.reportType}</span> · {r.status}</p>
                      {r.reasonText && <p className="mt-1 text-muted">{r.reasonText}</p>}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

