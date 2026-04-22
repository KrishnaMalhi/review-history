'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ThumbsUp, ThumbsDown, Clock, Pencil, Trash2, X, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, Badge, Skeleton, Button } from '@/components/ui';
import { useMyReviews, useUpdateReview, useDeleteReview } from '@/hooks/use-api';
import { useToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function MyReviewsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyReviews({ page, pageSize: 10 });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">All reviews you have submitted</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">You haven&apos;t written any reviews yet.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              Explore entities to review
            </Link>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {data.data.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>

            {/* Pagination */}
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
    </DashboardLayout>
  );
}

function ReviewItem({ review }: { review: any }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editTitle, setEditTitle] = useState(review.title || '');
  const [editBody, setEditBody] = useState(review.body || '');
  const updateMutation = useUpdateReview(review.id);
  const deleteMutation = useDeleteReview(review.id);

  const handleSave = () => {
    updateMutation.mutate(
      { title: editTitle, body: editBody },
      {
        onSuccess: () => {
          toast.success('Review updated');
          setEditing(false);
        },
        onError: () => toast.error('Failed to update review'),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => toast.success('Review deleted'),
      onError: () => toast.error('Failed to delete review'),
    });
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
                  )}
                />
              ))}
            </div>
            <Badge variant={review.status === 'published' ? 'success' : 'warning'}>
              {review.status}
            </Badge>
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={editTitle}
                maxLength={FIELD_LIMITS.REVIEW_TITLE}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Review title"
              />
              <textarea
                value={editBody}
                maxLength={FIELD_LIMITS.REVIEW_BODY}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Review body"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} loading={updateMutation.isPending}>
                  <Check className="mr-1 h-3 w-3" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  <X className="mr-1 h-3 w-3" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {review.title && (
                <h3 className="mt-2 font-semibold text-gray-900">{review.title}</h3>
              )}
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{review.body}</p>
            </>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" /> {review.helpfulCount ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsDown className="h-3 w-3" /> {review.unhelpfulCount ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Edit/Delete buttons */}
        {!editing && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mt-3 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">Delete this review permanently?</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="danger" loading={deleteMutation.isPending} onClick={handleDelete}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
