'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicLayout } from '@/components/layout';
import { Button, Input, Textarea, Card, CardContent, StarRating } from '@/components/ui';
import { useEntity, useCreateReview, useCategoryTags } from '@/hooks/use-api';
import { createReviewSchema, type CreateReviewInput } from '@/lib/validators';
import { useAuth } from '@/lib/auth-context';

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: entity } = useEntity(id);
  const createReview = useCreateReview(id);
  const { data: availableTags } = useCategoryTags(entity?.categoryKey || '');

  const [error, setError] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { rating: 0 },
  });

  if (!isAuthenticated) {
    router.replace(`/auth/login`);
    return null;
  }

  const onSubmit = async (data: CreateReviewInput) => {
    setError('');
    try {
      await createReview.mutateAsync({
        overallRating: data.rating,
        title: data.title,
        body: data.body,
        tagKeys: selectedTags,
      });
      router.push(`/entities/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review.');
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Write a Review</h1>
        {entity && (
          <p className="mb-6 text-gray-500">
            Reviewing: <span className="font-medium text-gray-700">{entity.name}</span>
          </p>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Rating */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your Rating
                </label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                      size="lg"
                    />
                  )}
                />
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                )}
              </div>

              {/* Title */}
              <Input
                label="Review Title (optional)"
                placeholder="Summarize your experience"
                maxLength={200}
                {...register('title')}
                error={errors.title?.message}
              />

              {/* Body */}
              <Textarea
                label="Your Review"
                placeholder="Share details of your experience (minimum 10 characters)..."
                maxLength={5000}
                {...register('body')}
                error={errors.body?.message}
                rows={6}
              />

              {/* Tags */}
              {availableTags && availableTags.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Warning Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag.key)
                              ? prev.filter((t) => t !== tag.key)
                              : [...prev, tag.key],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          selectedTags.includes(tag.key)
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Anonymous toggle */}
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isAnonymous')} className="rounded" />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>

              {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3">
                <Button type="submit" loading={createReview.isPending} className="flex-1">
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
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
