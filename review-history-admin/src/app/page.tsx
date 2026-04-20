'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Skeleton } from '@/components/ui';
import { useAdminDashboard } from '@/hooks/use-api';
import { Users, Building2, MessageSquare, Landmark } from 'lucide-react';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, gradient: 'gradient-primary', shadow: 'shadow-primary/20' },
  { key: 'totalEntities', label: 'Total Entities', icon: Building2, gradient: 'gradient-navy', shadow: 'shadow-navy/20' },
  { key: 'totalReviews', label: 'Total Reviews', icon: MessageSquare, gradient: 'gradient-accent', shadow: 'shadow-accent/20' },
  { key: 'pendingClaims', label: 'Pending Claims', icon: Landmark, gradient: 'bg-gradient-to-br from-purple-600 to-pink-500', shadow: 'shadow-purple-500/20' },
] as const;

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading } = useAdminDashboard();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Skeleton className="h-40 w-64" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Welcome back, {user?.displayName || 'Admin'}</p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : data ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              const val = data[s.key as keyof typeof data];
              return (
                <Card key={s.key} className="card-hover relative overflow-hidden p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted">{s.label}</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{typeof val === 'number' ? val : 0}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.gradient} shadow-lg ${s.shadow}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
