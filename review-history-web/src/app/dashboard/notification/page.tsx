'use client';

import { Card, CardContent, Button, Skeleton, EmptyState } from '@/components/ui';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-api';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, Check } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function DashboardNotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading: notifLoading } = useNotifications({ page, pageSize: 20 });
  const markRead = useMarkNotificationRead();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {data && <span className="text-sm text-gray-500">{data.unreadCount} unread</span>}
        </div>

        {notifLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <EmptyState title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-3">
            {data.data.map((notif) => (
              <Card key={notif.id} className={notif.readAt ? 'opacity-60' : ''}>
                <CardContent className="flex items-start gap-3 py-3">
                  <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.readAt && (
                    <button
                      onClick={() => markRead.mutate(notif.id)}
                      className="shrink-0 rounded-md p-1 text-gray-400 hover:text-green-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}

            {data.meta.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="flex items-center text-sm text-gray-500">Page {page} of {data.meta.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}