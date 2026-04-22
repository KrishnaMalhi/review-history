'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicLayout } from '@/components/layout';
import { Button, Input, Textarea, Card, CardContent, StarRating } from '@/components/ui';
import { useEntity, useCreateReview, useCategoryTags, useUploadFile } from '@/hooks/use-api';
import { createReviewSchema, type CreateReviewInput } from '@/lib/validators';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb, Paperclip, X } from 'lucide-react';
import {
  WorkplaceReviewFields,
  SchoolReviewFields,
  MedicalReviewFields,
  ProductReviewFields,
} from '@/components/review/category-fields';
import { FIELD_LIMITS } from '@shared/field-limits';

const EMPLOYER_KEYS = ['employer', 'company', 'workplace'];
const SCHOOL_KEYS = ['school', 'college', 'university', 'academy'];
const MEDICAL_KEYS = ['doctor', 'hospital', 'clinic', 'medical'];
const PRODUCT_KEYS = ['product', 'food', 'restaurant'];

function getCategoryGroup(categoryKey: string) {
  const k = categoryKey.toLowerCase();
  if (EMPLOYER_KEYS.some((e) => k.includes(e))) return 'employer';
  if (SCHOOL_KEYS.some((e) => k.includes(e))) return 'school';
  if (MEDICAL_KEYS.some((e) => k.includes(e))) return 'medical';
  if (PRODUCT_KEYS.some((e) => k.includes(e))) return 'product';
  return null;
}

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: entity } = useEntity(id);
  const createReview = useCreateReview(id);
  const { data: availableTags } = useCategoryTags(entity?.categoryKey || '');

  const [error, setError] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const uploadFile = useUploadFile();
  const categoryGroup = entity ? getCategoryGroup(entity.categoryKey) : null;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch('rating');
  const body = watch('body');

  if (!isAuthenticated) {
    router.replace(`/auth/login`);
    return null;
  }

  const getRatingLabel = (r: number) => {
    if (r === 0) return '';
    if (r <= 2) return '👎 Poor';
    if (r === 3) return '😐 Average';
    if (r === 4) return '👍 Good';
    return '⭐ Excellent';
  };

  // Progress calculation
  const steps = [
    { num: 1, label: 'Rating', done: rating > 0 },
    { num: 2, label: 'Title & Body', done: body && body.length >= 10 },
    { num: 3, label: 'Tags (optional)', done: true },
    { num: 4, label: 'Review', done: true },
  ];

  const completedSteps = steps.filter((s) => s.done).length;

  const onSubmit = async (data: CreateReviewInput) => {
    setError('');
    try {
      await createReview.mutateAsync({
        overallRating: data.rating,
        title: data.title,
        body: data.body,
        tagKeys: selectedTags,
        ...(Object.keys(categoryData).length > 0 && { categoryData }),
        ...(evidenceUrls.length > 0 && { evidenceUrls }),
      });
      router.push(`/entities/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review.');
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
            </div>
            {entity && (
              <p className="text-gray-500 ml-7">
                Reviewing: <span className="font-medium text-gray-700">{entity.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 rounded-lg bg-white p-4 ring-1 ring-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-900">Progress</span>
            <span className="text-xs text-gray-500">{completedSteps}/4 sections complete</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(completedSteps / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Rating */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  Step 1: Your Rating
                  {rating > 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        size="lg"
                      />
                      {rating > 0 && (
                        <p className="text-sm text-gray-600">Your rating: <span className="font-semibold text-gray-900">{getRatingLabel(rating)}</span></p>
                      )}
                    </div>
                  )}
                />
                {errors.rating && (
                  <p className="text-sm text-red-600">{errors.rating.message}</p>
                )}
              </div>

              {/* Step 2: Title & Body */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  Step 2: Title & Details
                  {body && body.length >= 10 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </label>

                <Input
                  label="Review Title (optional)"
                  placeholder="Summarize your main point"
                  maxLength={FIELD_LIMITS.REVIEW_TITLE}
                  {...register('title')}
                  error={errors.title?.message}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-900">Your Review</label>
                    <span className="text-xs text-gray-500">{(body || '').length}/5000</span>
                  </div>
                  <Textarea
                    placeholder="Share specific details... (minimum 10 characters)"
                    maxLength={FIELD_LIMITS.REVIEW_BODY}
                    {...register('body')}
                    error={errors.body?.message}
                    rows={6}
                  />
                </div>

                {/* Tips */}
                {body && body.length < 50 && (
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      <strong>Tip:</strong> More details help other readers. Include examples or comparisons.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Category-specific fields */}
              {categoryGroup && (
                <div className="space-y-4 pb-6 border-b border-gray-200">
                  <label className="text-sm font-semibold text-gray-900">Step 3: Additional Details</label>
                  {categoryGroup === 'employer' && (
                    <WorkplaceReviewFields values={categoryData} onChange={(k, v) => setCategoryData((p) => ({ ...p, [k]: v }))} />
                  )}
                  {categoryGroup === 'school' && (
                    <SchoolReviewFields values={categoryData} onChange={(k, v) => setCategoryData((p) => ({ ...p, [k]: v }))} />
                  )}
                  {categoryGroup === 'medical' && (
                    <MedicalReviewFields values={categoryData} onChange={(k, v) => setCategoryData((p) => ({ ...p, [k]: v }))} />
                  )}
                  {categoryGroup === 'product' && (
                    <ProductReviewFields values={categoryData} onChange={(k, v) => setCategoryData((p) => ({ ...p, [k]: v }))} />
                  )}
                </div>
              )}

              {/* Step 4: Tags */}
              {availableTags && availableTags.length > 0 && (
                <div className="pb-6 border-b border-gray-200">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Step 4: Warning Tags (optional)
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

              {/* Evidence Upload */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Supporting Evidence (optional)
                </label>
                <p className="text-xs text-gray-500">Attach up to 5 photos or PDF documents (max 5 MB each) to support your review.</p>

                {evidenceUrls.length < 5 && (
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:border-primary hover:bg-primary/5 transition-colors">
                    <Paperclip className="h-4 w-4 shrink-0" />
                    {uploadFile.isPending ? 'Uploading...' : 'Click to attach file'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                      disabled={uploadFile.isPending}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = '';
                        try {
                          const result = await uploadFile.mutateAsync(file);
                          setEvidenceUrls((prev) => [...prev, result.url].slice(0, 5));
                        } catch {
                          setError('Upload failed. Please try again.');
                        }
                      }}
                    />
                  </label>
                )}

                {evidenceUrls.length > 0 && (
                  <ul className="space-y-1.5">
                    {evidenceUrls.map((url, idx) => (
                      <li key={url} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                        <span className="truncate max-w-xs">{url.split('/').pop()}</span>
                        <button
                          type="button"
                          onClick={() => setEvidenceUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="ml-2 shrink-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Anonymous toggle */}
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isAnonymous')} className="rounded" />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  loading={createReview.isPending} 
                  className="flex-1"
                  disabled={!rating || !body || body.length < 10}
                >
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
