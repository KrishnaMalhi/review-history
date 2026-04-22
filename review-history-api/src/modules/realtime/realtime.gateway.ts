import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WS disconnected: ${client.id}`);
  }

  /** Client joins a discussion room to receive live comment updates */
  @SubscribeMessage('join:discussion')
  handleJoinDiscussion(
    @MessageBody() discussionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`discussion:${discussionId}`);
  }

  /** Client leaves a discussion room */
  @SubscribeMessage('leave:discussion')
  handleLeaveDiscussion(
    @MessageBody() discussionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`discussion:${discussionId}`);
  }

  /** Client joins the global feed room */
  @SubscribeMessage('join:feed')
  handleJoinFeed(@ConnectedSocket() client: Socket) {
    client.join('feed');
  }

  /** Client leaves the feed room */
  @SubscribeMessage('leave:feed')
  handleLeaveFeed(@ConnectedSocket() client: Socket) {
    client.leave('feed');
  }

  /** Client joins a review room to receive live vote updates */
  @SubscribeMessage('join:review')
  handleJoinReview(
    @MessageBody() reviewId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`review:${reviewId}`);
  }

  /** Client leaves a review room */
  @SubscribeMessage('leave:review')
  handleLeaveReview(
    @MessageBody() reviewId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`review:${reviewId}`);
  }

  // ── Emitters called by service/controller ──────────────────────────────────

  /** Broadcast a new comment to all clients in the discussion room */
  emitDiscussionComment(discussionId: string, comment: unknown) {
    this.server.to(`discussion:${discussionId}`).emit('discussion:new_comment', {
      discussionId,
      comment,
    });
  }

  /** Broadcast a reaction update (like/dislike counts) */
  emitDiscussionReaction(
    discussionId: string,
    likeCount: number,
    dislikeCount: number,
  ) {
    this.server.to(`discussion:${discussionId}`).emit('discussion:reaction', {
      discussionId,
      likeCount,
      dislikeCount,
    });
  }

  /** Broadcast a new review to all feed subscribers */
  emitFeedReview(review: unknown) {
    this.server.to('feed').emit('feed:new_review', review);
  }

  /** Broadcast vote count update to clients subscribed to a specific review */
  emitReviewVote(
    reviewId: string,
    helpful: number,
    notHelpful: number,
    seemsFake: number,
  ) {
    this.server.to(`review:${reviewId}`).emit('review:vote_update', {
      reviewId,
      helpful,
      notHelpful,
      seemsFake,
    });
    // Also notify feed room so feed cards can update live
    this.server.to('feed').emit('feed:vote_update', {
      reviewId,
      helpful,
      notHelpful,
      seemsFake,
    });
  }

  /** Broadcast a new review comment */
  emitReviewComment(reviewId: string, comment: unknown, totalComments: number) {
    const payload = { reviewId, comment, totalComments };
    this.server.to(`review:${reviewId}`).emit('review:new_comment', payload);
    this.server.to('feed').emit('feed:review_comment', payload);
  }

  /** Broadcast review comment reaction counts */
  emitReviewCommentReaction(
    reviewId: string,
    commentId: string,
    likeCount: number,
    dislikeCount: number,
  ) {
    const payload = { reviewId, commentId, likeCount, dislikeCount };
    this.server.to(`review:${reviewId}`).emit('review:comment_reaction', payload);
    this.server.to('feed').emit('feed:comment_reaction', payload);
  }
}
