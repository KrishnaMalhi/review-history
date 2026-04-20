'use client';

import { CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useCommunityValidations, useValidateReview } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';

export function CommunityValidation({ reviewId }: { reviewId: string }) {
  const { isAuthenticated } = useAuth();
  const { data: summary } = useCommunityValidations(reviewId);
  const validateMut = useValidateReview();
  const toast = useToast();

  if (!summary) return null;

  const handleVote = (validationType: string) => {
    if (!isAuthenticated) return;
    validateMut.mutate(
      { reviewId, validationType },
      {
        onSuccess: () => toast.success('Validation recorded'),
        onError: () => toast.error('Could not submit validation'),
      },
    );
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-muted">Community:</span>
      <button
        onClick={() => handleVote('confirmed')}
        disabled={validateMut.isPending || !isAuthenticated}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-green-700 hover:bg-green-50 disabled:opacity-50"
      >
        <CheckCircle className="h-3 w-3" />
        {summary.confirmed}
      </button>
      <button
        onClick={() => handleVote('outdated')}
        disabled={validateMut.isPending || !isAuthenticated}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
      >
        <AlertTriangle className="h-3 w-3" />
        {summary.outdated}
      </button>
      <button
        onClick={() => handleVote('resolved')}
        disabled={validateMut.isPending || !isAuthenticated}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
      >
        <RotateCcw className="h-3 w-3" />
        {summary.resolved}
      </button>
    </div>
  );
}
