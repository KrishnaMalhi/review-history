'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { apiGet } from '@/lib/api-client';

type ProfileType = 'employer' | 'school' | 'medical' | 'product';

export default function EntityProfileDetailPage() {
  const params = useParams();
  const type = String(params.type || '') as ProfileType;
  const entityId = String(params.entityId || '');

  const profileQuery = useQuery({
    queryKey: ['entityProfileDetail', type, entityId],
    queryFn: async () => {
      if (type === 'employer') {
        return apiGet<any>(`/entities/${entityId}/employer-profile`);
      }
      return apiGet<any>(`/category-extensions/entities/${entityId}/profile`);
    },
    enabled: !!entityId,
  });

  const entityQuery = useQuery({
    queryKey: ['entityProfileDetailEntity', entityId],
    queryFn: () => apiGet<any>(`/entities/${entityId}`),
    enabled: !!entityId,
  });

  const profile = profileQuery.data;
  const entity = entityQuery.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entity Profile Details</h1>
            <p className="text-sm text-muted">Detailed view for {type} profile</p>
          </div>
          <Link href="/entity-profiles">
            <Button variant="outline">Back to Entity Profiles</Button>
          </Link>
        </div>

        {profileQuery.isLoading || entityQuery.isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : !profile ? (
          <Card className="p-8 text-center text-muted">Profile not found</Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{entity?.name || entity?.displayName || 'Entity'}</h2>
                <Badge>{type}</Badge>
                {type === 'employer' && (
                  <Badge variant={profile.isVerified ? 'success' : 'warning'}>
                    {profile.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                )}
              </div>

              <InfoGrid
                items={[
                  ['Entity ID', entityId],
                  ['Profile ID', profile.id ?? '-'],
                  ['Website', profile.websiteUrl ?? '-'],
                  ['Description', profile.description ?? '-'],
                  ['Created', profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '-'],
                  ['Updated', profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '-'],
                  ['Industry', profile.industry ?? '-'],
                  ['Employer Size', profile.employerSize ?? '-'],
                  ['School Type', profile.schoolType ?? '-'],
                  ['Specialization', profile.specialization ?? '-'],
                  ['Brand', profile.brand ?? '-'],
                  ['Product Category', profile.productCategory ?? '-'],
                  ['Barcode', profile.barcode ?? '-'],
                ]}
              />
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}

