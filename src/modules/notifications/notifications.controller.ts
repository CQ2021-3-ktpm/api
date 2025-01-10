import { Controller, Get, Param, Patch, UseInterceptors } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { AuthUser } from 'src/decorators';
import { User } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

@ApiTags('Notifications')
@Controller('/api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron('*/50 * * * * *')
  async simulateNotification() {
    await this.notificationsService.simulateNotification();
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Return user notifications',
  })
  @UseInterceptors(
    new TransformInterceptor('User notifications retrieved successfully'),
  )
  async getUserNotifications(@AuthUser() user: User) {
    return this.notificationsService.getUserNotifications(user.user_id);
  }

  @Patch('/:notificationId/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  @UseInterceptors(
    new TransformInterceptor('Notification marked as read successfully'),
  )
  async markNotificationAsRead(
    @AuthUser() user: User,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markNotificationAsRead(
      notificationId,
      user.user_id,
    );
  }

  @Patch('/mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  @UseInterceptors(
    new TransformInterceptor('All notifications marked as read successfully'),
  )
  async markAllNotificationsAsRead(@AuthUser() user: User) {
    return this.notificationsService.markAllNotificationsAsRead(user.user_id);
  }
}
