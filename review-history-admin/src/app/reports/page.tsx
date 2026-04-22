'use client';

import { useState } from 'react';
import { Flag, AlertTriangle, User } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useAdminReports } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const REPORT_TYPE_LABELS: Record<string, string> = {
  spam: 'Spam',
  fake_review: 'Fake Review',
  threatening_content: 'Threatening Content',
  harassment: 'Harassment',
  personal_information: 'Personal Information',
  off_topic: 'Off Topic',
  other: 'Other',
};

const SEVERITY_TYPES = new Set(['threatening_content', 'harassment', 'personal_information']);

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [reportType, setReportType] = useState('');
  const { data, isLoading } = useAdminReports({ page, pageSize: 25, ...(reportType && { reportType }) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent shadow-md shadow-accent/20">
            <Flag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Reports</h1>
            <p className="text-sm text-muted">User-submitted reports on reviews</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => { setReportType(e.target.value); setPage(1); }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Report Types</option>
            {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="p-12 text-center">
            <Flag className="mx-auto h-10 w-10 text-primary/40" />
            <p className="mt-3 text-muted">No reports found.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((report) => (
                <Card key={report.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-1.5">
                      {/* Reporter */}
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{report.reporter?.displayName ?? 'Anonymous'}</span>
                        <span className="text-border">·</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Report type */}
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'text-xs',
                            SEVERITY_TYPES.has(report.reportType)
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-200/50'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
                          )}
                        >
                          {SEVERITY_TYPES.has(report.reportType) && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
                        </Badge>
                        {SEVERITY_TYPES.has(report.reportType) && (
                          <span className="text-xs font-medium text-red-600">Legal alert sent</span>
                        )}
                      </div>

                      {/* Reason */}
                      {report.reasonText && (
                        <p className="text-sm text-foreground/80 line-clamp-2">{report.reasonText}</p>
                      )}

                      {/* Review excerpt */}
                      {report.review && (
                        <div className="rounded-md bg-surface/60 border border-border/50 px-3 py-2 text-xs text-muted">
                          <span className="font-medium text-foreground/70">
                            {report.review.entity?.name ?? 'Unknown entity'} · {report.review.rating}★
                          </span>
                          <p className="mt-0.5 line-clamp-2">{report.review.body}</p>
                        </div>
                      )}
                    </div>

                    {/* Link to moderation */}
                    <div className="flex shrink-0 gap-2">
                      {report.review && (
                        <Link
                          href={`/reviews?highlight=${report.reviewId}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 border border-primary/20"
                        >
                          View Review
                        </Link>
                      )}
                    </div>
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
