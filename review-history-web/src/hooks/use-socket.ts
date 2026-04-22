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
export function useFeedSocket(
  onNewReview: (review: unknown) => void,
  onVoteUpdate?: (payload: { reviewId: string; helpful: number; notHelpful: number; seemsFake: number }) => void,
) {
  const onNewReviewRef = useRef(onNewReview);
  const onVoteUpdateRef = useRef(onVoteUpdate);
  onNewReviewRef.current = onNewReview;
  onVoteUpdateRef.current = onVoteUpdate;

  const handleNew = useCallback((review: unknown) => {
    onNewReviewRef.current(review);
  }, []);

  const handleVote = useCallback((payload: { reviewId: string; helpful: number; notHelpful: number; seemsFake: number }) => {
    onVoteUpdateRef.current?.(payload);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    refCount++;
    if (!socket.connected) socket.connect();

    socket.emit('join:feed');
    socket.on('feed:new_review', handleNew);
    socket.on('feed:vote_update', handleVote);

    return () => {
      socket.emit('leave:feed');
      socket.off('feed:new_review', handleNew);
      socket.off('feed:vote_update', handleVote);
      refCount--;
      if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
      }
    };
  }, [handleNew, handleVote]);
}

/** Subscribe to real-time vote updates for a specific review */
export function useReviewVoteSocket(
  reviewId: string | null,
  onVoteUpdate: (payload: { reviewId: string; helpful: number; notHelpful: number; seemsFake: number }) => void,
) {
  const onVoteUpdateRef = useRef(onVoteUpdate);
  onVoteUpdateRef.current = onVoteUpdate;

  useEffect(() => {
    if (!reviewId) return;

    const socket = getSocket();
    refCount++;
    if (!socket.connected) socket.connect();

    socket.emit('join:review', reviewId);

    const handleVote = (payload: { reviewId: string; helpful: number; notHelpful: number; seemsFake: number }) => {
      if (payload.reviewId === reviewId) {
        onVoteUpdateRef.current(payload);
      }
    };

    socket.on('review:vote_update', handleVote);

    return () => {
      socket.emit('leave:review', reviewId);
      socket.off('review:vote_update', handleVote);
      refCount--;
      if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
      }
    };
  }, [reviewId]);
}

/** Subscribe to real-time review vote/comment/comment-reaction updates */
export function useReviewInteractionSocket(
  reviewId: string | null,
  handlers: {
    onVoteUpdate?: (payload: { reviewId: string; helpful: number; notHelpful: number; seemsFake: number }) => void;
    onNewComment?: (payload: { reviewId: string; comment: unknown; totalComments: number }) => void;
    onCommentReaction?: (payload: { reviewId: string; commentId: string; likeCount: number; dislikeCount: number }) => void;
  },
) {
  const onVoteUpdateRef = useRef(handlers.onVoteUpdate);
  const onNewCommentRef = useRef(handlers.onNewComment);
  const onCommentReactionRef = useRef(handlers.onCommentReaction);
  onVoteUpdateRef.current = handlers.onVoteUpdate;
  onNewCommentRef.current = handlers.onNewComment;
  onCommentReactionRef.current = handlers.onCommentReaction;

  useEffect(() => {
    if (!reviewId) return;

    const socket = getSocket();
    refCount++;
    if (!socket.connected) socket.connect();

    socket.emit('join:review', reviewId);

    const handleVote = (payload: { reviewId: string; helpful: number; notHelpful: number; seemsFake: number }) => {
      if (payload.reviewId === reviewId) {
        onVoteUpdateRef.current?.(payload);
      }
    };
    const handleComment = (payload: { reviewId: string; comment: unknown; totalComments: number }) => {
      if (payload.reviewId === reviewId) {
        onNewCommentRef.current?.(payload);
      }
    };
    const handleCommentReaction = (payload: { reviewId: string; commentId: string; likeCount: number; dislikeCount: number }) => {
      if (payload.reviewId === reviewId) {
        onCommentReactionRef.current?.(payload);
      }
    };

    socket.on('review:vote_update', handleVote);
    socket.on('review:new_comment', handleComment);
    socket.on('review:comment_reaction', handleCommentReaction);

    return () => {
      socket.emit('leave:review', reviewId);
      socket.off('review:vote_update', handleVote);
      socket.off('review:new_comment', handleComment);
      socket.off('review:comment_reaction', handleCommentReaction);
      refCount--;
      if (refCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        refCount = 0;
      }
    };
  }, [reviewId]);
}
