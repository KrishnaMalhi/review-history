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
}
