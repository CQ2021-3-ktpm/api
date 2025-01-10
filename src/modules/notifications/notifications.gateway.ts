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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements NotificationEvents, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets: Map<string, string> = new Map();

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.headers.userid as string;
      if (userId) {
        this.userSockets.set(userId, client.id);
        this.logger.log(`Client connected: ${userId}`);
      }
    } catch (error) {
      this.logger.error('Connection error:', error);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const userId = Array.from(this.userSockets.entries()).find(
        ([_, socketId]) => socketId === client.id,
      )?.[0];
      if (userId) {
        this.userSockets.delete(userId);
        this.logger.log(`Client disconnected: ${userId}`);
      }
    } catch (error) {
      this.logger.error('Disconnection error:', error);
    }
  }

  async sendNotification(userId: string, notification: any) {
    try {
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('notification', notification);
        this.logger.log(`Notification sent to user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Error sending notification:', error);
    }
  }
}
