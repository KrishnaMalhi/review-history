'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicLayout } from '@/components/layout';
import { Button, Input, Select, Card, CardContent } from '@/components/ui';
import { useCategories, useCities, useLocalities, useCreateEntity } from '@/hooks/use-api';
import { createEntitySchema, type CreateEntityInput } from '@/lib/validators';
import { useAuth } from '@/lib/auth-context';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AddEntityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: categories } = useCategories();
  const createEntity = useCreateEntity();
  const [error, setError] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [resolvedCityId, setResolvedCityId] = useState('');
  const debouncedCityQuery = useDebounce(cityQuery, 300);

  // Fetch cities with debounced search — only PK cities returned from server
  const { data: cities, isFetching: citiesLoading } = useCities(
    debouncedCityQuery.length >= 1 ? debouncedCityQuery : undefined,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateEntityInput>({
    resolver: zodResolver(createEntitySchema),
  });

  const { data: localities } = useLocalities(resolvedCityId);

  const resolveCityId = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized || !cities?.length) return '';

      const exact = cities.find((city) => city.name.trim().toLowerCase() === normalized);
      if (exact) return exact.id;

      const startsWith = cities.filter((city) =>
        city.name.trim().toLowerCase().startsWith(normalized),
      );
      if (startsWith.length === 1) return startsWith[0].id;

      return '';
    },
    [cities],
  );

  // Resolve cityId whenever cities data changes (after search results arrive)
  useEffect(() => {
    if (cityQuery && cities?.length) {
      const resolved = resolveCityId(cityQuery);
      if (resolved) {
        setResolvedCityId(resolved);
        setValue('cityId', resolved, { shouldValidate: true });
      }
    }
  }, [cities, cityQuery, resolveCityId, setValue]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: CreateEntityInput) => {
    setError('');
    const normalizeOptional = (value?: string) => {
      const trimmed = value?.trim();
      if (!trimmed) return undefined;
      const lowered = trimmed.toLowerCase();
      if (
        lowered === 'entity phone (optional)' ||
        lowered === 'address (optional)' ||
        lowered === 'landmark (optional)'
      ) {
        return undefined;
      }
      return trimmed;
    };

    const resolvedCityId = data.cityId || resolveCityId(cityQuery);
    const payload = {
      ...data,
      cityId: resolvedCityId,
      localityId: normalizeOptional(data.localityId),
      phone: normalizeOptional(data.phone),
      addressLine: normalizeOptional(data.addressLine),
      landmark: normalizeOptional(data.landmark),
    };

    if (!resolvedCityId) {
      setError('Please select a valid city from the suggestions.');
      return;
    }

    try {
      const result = await createEntity.mutateAsync(payload as Record<string, unknown>);
      router.push(`/entities/${result.entityId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create entity.');
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Add a New Entity</h1>
        <p className="mb-6 text-sm text-gray-500">
          Can&apos;t find what you&apos;re looking for? Add it here for others to review.
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Category */}
              {categories && (
                <Select
                  label="Category"
                  placeholder="Select a category"
                  options={categories.map((c) => ({ value: c.key, label: c.name }))}
                  {...register('categoryKey')}
                  error={errors.categoryKey?.message}
                />
              )}

              {/* Name */}
              <Input
                label="Entity Name"
                placeholder="e.g. Dr. Ahmed Ali, Ali's Workshop"
                maxLength={200}
                {...register('displayName')}
                error={errors.displayName?.message}
              />

              {/* City */}
              <div>
                <Input
                  label="City"
                  placeholder="Type city name to search..."
                  value={cityQuery}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCityQuery(next);
                    const resolved = resolveCityId(next);
                    setResolvedCityId(resolved);
                    setValue('cityId', resolved, { shouldValidate: true });
                  }}
                  onBlur={(e) => {
                    const resolved = resolveCityId(e.target.value);
                    setResolvedCityId(resolved);
                    setValue('cityId', resolved, { shouldValidate: true });
                  }}
                  list="pakistan-city-options"
                  maxLength={100}
                  error={errors.cityId?.message}
                />
                {citiesLoading && cityQuery.length >= 1 && (
                  <p className="mt-1 text-xs text-gray-400">Searching cities...</p>
                )}
                <datalist id="pakistan-city-options">
                  {(cities || []).map((city) => (
                    <option key={city.id} value={city.name} />
                  ))}
                </datalist>
                <input type="hidden" {...register('cityId')} />
              </div>

              {/* Locality */}
              {localities && localities.length > 0 && (
                <Select
                  label="Locality / Area (optional)"
                  placeholder="Select a locality"
                  options={localities.map((l) => ({ value: l.id, label: l.name }))}
                  {...register('localityId')}
                  error={errors.localityId?.message}
                />
              )}

              {/* Phone */}
              <Input
                label="Entity Phone (optional)"
                placeholder="03001234567"
                maxLength={20}
                {...register('phone')}
                error={errors.phone?.message}
              />

              {/* Address */}
              <Input
                label="Address (optional)"
                placeholder="Street address or location"
                maxLength={300}
                {...register('addressLine')}
                error={errors.addressLine?.message}
              />

              {/* Landmark */}
              <Input
                label="Landmark (optional)"
                placeholder="Near / opposite to..."
                maxLength={200}
                {...register('landmark')}
                error={errors.landmark?.message}
              />

              {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3">
                <Button type="submit" loading={createEntity.isPending} className="flex-1">
                  Add Entity
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
