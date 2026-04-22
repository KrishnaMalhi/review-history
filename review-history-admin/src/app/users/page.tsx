'use client';

import { useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminUsers({ page, pageSize: 20, search: search || undefined });
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const toast = useToast();

  const handleStatusToggle = (id: string, current: string) => {
    const newStatus = current === 'active' ? 'suspended' : 'active';
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => toast.success(`User ${newStatus}`),
        onError: () => toast.error('Failed to update status'),
      },
    );
  };

  const handleRoleChange = (id: string, role: string) => {
    updateRole.mutate(
      { id, role },
      {
        onSuccess: () => toast.success('Role updated'),
        onError: () => toast.error('Failed to update role'),
      },
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md shadow-primary/20">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Management</h1>
              <p className="text-sm text-muted">Manage user roles and status</p>
            </div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          maxLength={FIELD_LIMITS.SEARCH_Q}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md rounded-xl border border-border bg-white px-4 py-2.5 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="p-12 text-center">
            <UsersIcon className="mx-auto h-10 w-10 text-muted/50" />
            <p className="mt-3 text-muted">No users found.</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">User</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Phone</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Role</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {data.data.map((user) => (
                      <tr key={user.id}>
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          {user.displayName || 'Anonymous'}
                        </td>
                        <td className="px-5 py-3.5 text-muted">{user.phone}</td>
                        <td className="px-5 py-3.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium focus:border-primary focus:outline-none"
                          >
                          <option value="user">User</option>
                          <option value="claimed_owner">Claimed Owner</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                          {user.status}
                        </Badge>
                      </td>
<td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleStatusToggle(user.id, user.status)}
                          disabled={updateStatus.isPending}
                          className="rounded-lg px-3 py-1 text-xs font-semibold text-muted hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
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
