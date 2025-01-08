import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationEvents } from './interfaces/notification-events.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, NotificationEvents
{
  private readonly logger = new Logger(NotificationsGateway.name);
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    client.join(`user-${userId}`);
    this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async sendNotification(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }
}
