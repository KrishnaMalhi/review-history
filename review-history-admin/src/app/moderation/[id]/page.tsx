'use client';

import { use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { useAdminModerationCase, useResolveModerationCase } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

export default function ModerationCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data, isLoading } = useAdminModerationCase(id);
  const resolve = useResolveModerationCase(id);

  const handleAction = (actionType: string) => {
    resolve.mutate(
      { actionType },
      {
        onSuccess: () => toast.success('Moderation case updated'),
        onError: () => toast.error('Failed to update moderation case'),
      },
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Moderation Case Detail</h1>
            <p className="text-sm text-muted">Case ID: {id}</p>
          </div>
          <Link href="/moderation" className="text-sm font-medium text-primary hover:underline">
            Back to Moderation
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !data ? (
          <Card className="p-8 text-center text-muted">Case not found</Card>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{data.type}</Badge>
                <Badge variant={data.status === 'open' ? 'warning' : data.status === 'resolved' ? 'success' : 'default'}>
                  {data.status}
                </Badge>
                <Badge variant="info">{data.severity}</Badge>
                <span className="text-xs text-muted">Opened: {new Date(data.openedAt).toLocaleString()}</span>
                {data.resolvedAt && (
                  <span className="text-xs text-muted">Closed: {new Date(data.resolvedAt).toLocaleString()}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-foreground/80">{data.description}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => handleAction('keep')} disabled={resolve.isPending || data.status !== 'open'}>
                  Keep
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('close_case')}
                  disabled={resolve.isPending || data.status !== 'open'}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('hide_review')}
                  disabled={resolve.isPending || data.status !== 'open'}
                >
                  Hide Review
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAction('remove_review')}
                  disabled={resolve.isPending || data.status !== 'open'}
                >
                  Remove Review
                </Button>
              </div>
            </Card>

            {data.review && (
              <Card className="p-5">
                <h2 className="text-lg font-semibold text-foreground">Linked Review</h2>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p><span className="font-medium">Entity:</span> {data.review.entity?.displayName}</p>
                    <p><span className="font-medium">Category:</span> {data.review.entity?.category?.nameEn}</p>
                    <p><span className="font-medium">City:</span> {data.review.entity?.city?.nameEn}</p>
                    <p><span className="font-medium">Rating:</span> {data.review.overallRating}</p>
                    <p><span className="font-medium">Status:</span> {data.review.status}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Author:</span> {data.review.author?.displayName || 'Anonymous'}</p>
                    <p><span className="font-medium">Email:</span> {data.review.author?.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {data.review.author?.phoneE164 || 'N/A'}</p>
                    <p><span className="font-medium">Created:</span> {new Date(data.review.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {data.review.title && <p className="mt-4 text-sm font-semibold text-foreground">{data.review.title}</p>}
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm text-foreground/85">{data.review.body}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(data.review.tagLinks || []).map((tl: any) => (
                    <Badge key={tl.id} variant={tl.tag?.isPositive ? 'success' : 'warning'}>
                      {tl.tag?.labelEn || tl.tag?.key}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">Reports ({data.review.reports?.length || 0})</p>
                  <div className="mt-2 space-y-2">
                    {(data.review.reports || []).slice(0, 10).map((r: any) => (
                      <div key={r.id} className="rounded-lg border border-border p-2 text-xs text-muted">
                        <span className="font-medium text-foreground">{r.reportType}</span> · {r.status} · {new Date(r.createdAt).toLocaleString()}
                        {r.reasonText && <p className="mt-1">{r.reasonText}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

