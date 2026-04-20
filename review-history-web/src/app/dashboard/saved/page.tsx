'use client';

import Link from 'next/link';
import { Bookmark, MapPin, Star, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useSavedEntities, useUnsaveEntity } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';

export default function SavedEntitiesPage() {
  const { data: entities, isLoading } = useSavedEntities();
  const unsave = useUnsaveEntity();
  const toast = useToast();

  const handleUnsave = (entityId: string) => {
    unsave.mutate(entityId, {
      onSuccess: () => toast.success('Removed from saved'),
      onError: () => toast.error('Failed to remove'),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Entities</h1>
          <p className="mt-1 text-sm text-gray-500">Entities you&apos;ve bookmarked for later</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : !entities?.length ? (
          <EmptyState
            title="No saved entities"
            description="Bookmark entities you want to track by clicking the bookmark icon on any entity page."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {entities.map((entity) => (
              <Card key={entity.id} className="relative">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/entities/${entity.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {entity.name}
                    </Link>
                    <button
                      onClick={() => handleUnsave(entity.id)}
                      disabled={unsave.isPending}
                      className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {entity.address && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> {entity.address}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {entity.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {entity.reviewCount || 0} reviews
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge>{entity.categoryKey}</Badge>
                    {entity.city && <Badge variant="info">{entity.city}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
