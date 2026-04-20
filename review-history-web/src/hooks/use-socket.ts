'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/v1$/, '');

let sharedSocket: Socket | null = null;
let refCount = 0;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(`${SOCKET_URL}/realtime`, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return sharedSocket;
}

/** Low-level hook — manage lifecycle of the shared socket */
export function useSocket() {
  useEffect(() => {
    const socket = getSocket();
    refCount++;
    if (!socket.connected) socket.connect();

    return () => {
      refCount--;
      if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
      }
    };
  }, []);

  return getSocket;
}

/** Subscribe to real-time updates for a specific discussion */
export function useDiscussionSocket(
  discussionId: string | null,
  onNewComment: (payload: { discussionId: string; comment: unknown }) => void,
  onReaction: (payload: { discussionId: string; likeCount: number; dislikeCount: number }) => void,
) {
  const onNewCommentRef = useRef(onNewComment);
  const onReactionRef = useRef(onReaction);
  onNewCommentRef.current = onNewComment;
  onReactionRef.current = onReaction;

  useEffect(() => {
    if (!discussionId) return;

    const socket = getSocket();
    refCount++;
    if (!socket.connected) socket.connect();

    socket.emit('join:discussion', discussionId);

    const handleComment = (payload: { discussionId: string; comment: unknown }) => {
      if (payload.discussionId === discussionId) {
        onNewCommentRef.current(payload);
      }
    };
    const handleReaction = (payload: {
      discussionId: string;
      likeCount: number;
      dislikeCount: number;
    }) => {
      if (payload.discussionId === discussionId) {
        onReactionRef.current(payload);
      }
    };

    socket.on('discussion:new_comment', handleComment);
    socket.on('discussion:reaction', handleReaction);

    return () => {
      socket.emit('leave:discussion', discussionId);
      socket.off('discussion:new_comment', handleComment);
      socket.off('discussion:reaction', handleReaction);
      refCount--;
      if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
      }
    };
  }, [discussionId]);
}

/** Subscribe to real-time new reviews on the feed */
export function useFeedSocket(onNewReview: (review: unknown) => void) {
  const onNewReviewRef = useRef(onNewReview);
  onNewReviewRef.current = onNewReview;

  const handleNew = useCallback((review: unknown) => {
    onNewReviewRef.current(review);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    refCount++;
    if (!socket.connected) socket.connect();

    socket.emit('join:feed');
    socket.on('feed:new_review', handleNew);

    return () => {
      socket.emit('leave:feed');
      socket.off('feed:new_review', handleNew);
      refCount--;
      if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
      }
    };
  }, [handleNew]);
}
