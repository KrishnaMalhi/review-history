'use client';

import { useState } from 'react';
import { Bell, BellOff, X, Heart, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { useMyFollows, useFollowEntity, useUnfollow } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';
import { getApiErrorMessage } from '@/lib/api-client';

export function FollowButton({ entityId, entityName }: { entityId: string; entityName?: string }) {
  const { isAuthenticated } = useAuth();
  const { data: follows } = useMyFollows();
  const followMut = useFollowEntity();
  const unfollowMut = useUnfollow();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);

  if (!isAuthenticated) return null;

  const existing = follows?.find((f) => f.targetType === 'entity' && f.targetId === entityId);

  const handleFollow = () => {
    followMut.mutate(
      { targetType: 'entity', targetId: entityId },
      {
        onSuccess: () => {
          toast.success('Now following — you\'ll get updates');
          setShowModal(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to follow')),
      },
    );
  };

  if (existing) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={unfollowMut.isPending}
        onClick={() =>
          unfollowMut.mutate(
            { targetType: 'entity', targetId: entityId },
            {
              onSuccess: () => toast.success('Unfollowed'),
              onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to unfollow')),
            },
          )
        }
      >
        <BellOff className="mr-1.5 h-4 w-4" />
        Following
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={followMut.isPending}
        onClick={() => setShowModal(true)}
      >
        <Bell className="mr-1.5 h-4 w-4" />
        Follow
      </Button>

      {/* Follow Benefits Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Follow {entityName || 'this entity'}?</h2>
                <p className="text-sm text-gray-600 mt-1">Get the latest updates and insights</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Benefits Grid */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 border border-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">New Reviews</p>
                  <p className="text-xs text-blue-700">Be the first to see new reviews as they&apos;re posted</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 border border-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Trending Insights</p>
                  <p className="text-xs text-purple-700">Get notified of emerging patterns and trends</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-pink-50 p-3 border border-pink-100">
                <Heart className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-pink-900">Stay Updated</p>
                  <p className="text-xs text-pink-700">Receive weekly digests of activity you care about</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 border border-amber-100">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Save Time</p>
                  <p className="text-xs text-amber-700">Never miss important updates or changes</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="py-3 border-t border-gray-200 flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-600">Followers</p>
                <p className="text-lg font-semibold text-gray-900">1.2K</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Recent Reviews</p>
                <p className="text-lg font-semibold text-gray-900">284</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Not now
              </Button>
              <Button
                className="flex-1"
                disabled={followMut.isPending}
                onClick={handleFollow}
              >
                <Bell className="mr-1.5 h-4 w-4" />
                Follow Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
