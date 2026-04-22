'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useAdminReviews } from '@/hooks/use-api';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const { data, isLoading } = useAdminReviews({
    page,
    pageSize: 20,
    status: status || undefined,
    q: q || undefined,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Review Management</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={q}
            maxLength={FIELD_LIMITS.SEARCH_Q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by review, entity, or author"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="under_verification">Under Verification</option>
            <option value="hidden">Hidden</option>
            <option value="removed">Removed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="p-8 text-center text-muted">No reviews found.</Card>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge>{r.status}</Badge>
                        <Badge variant="info">Rating {r.overallRating}</Badge>
                        <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{r.entity?.displayName}</p>
                      <p className="mt-1 text-xs text-muted">
                        By {r.author?.displayName || r.author?.email || r.author?.phoneE164}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                        {r.title || 'Review'}: {r.body}
                      </p>
                    </div>
                    <Link
                      href={`/reviews/${r.id}`}
                      className="rounded-lg bg-primary-light px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Manage
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface disabled:opacity-40"
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
