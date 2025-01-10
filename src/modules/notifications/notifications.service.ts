import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType } from '@prisma/client';
import { handleError } from 'src/common/utils';
import { NotificationEvents } from './interfaces/notification-events.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NOTIFICATION_EVENTS')
    private readonly notificationEvents: NotificationEvents,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkUpcomingCampaigns() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Get campaigns starting in next 24 hours or 30 minutes
      const upcomingCampaigns = await this.prisma.campaign.findMany({
        where: {
          status: 'ACTIVE',
          start_date: {
            gt: now,
            lte: in24Hours,
          },
          wishlists: {
            some: {},
          },
        },
        include: {
          brand: {
            select: {
              name: true,
            },
          },
          wishlists: {
            select: {
              user_id: true,
            },
          },
        },
      });

      for (const campaign of upcomingCampaigns) {
        const timeUntilStart = campaign.start_date.getTime() - now.getTime();
        const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);

        for (const wishlist of campaign.wishlists) {
          const userId = wishlist.user_id;
          let notificationType: NotificationType;
          let message: string;

          if (hoursUntilStart <= 0.5) {
            notificationType = NotificationType.CAMPAIGN_START_30MIN;
            message = `Campaign "${campaign.name}" by ${campaign.brand.name} starts in 30 minutes!`;
          } else if (hoursUntilStart <= 24) {
            notificationType = NotificationType.CAMPAIGN_START_24H;
            message = `Campaign "${campaign.name}" by ${campaign.brand.name} starts in 24 hours!`;
          }

          // Check if notification already sent
          const existingNotification = await this.prisma.notification.findFirst(
            {
              where: {
                user_id: userId,
                campaign_id: campaign.campaign_id,
                type: notificationType,
              },
            },
          );

          if (!existingNotification) {
            // Create notification in database
            const notification = await this.prisma.notification.create({
              data: {
                user_id: userId,
                campaign_id: campaign.campaign_id,
                message: message,
                type: notificationType,
              },
            });

            // Send realtime notification
            await this.notificationEvents.sendNotification(userId, {
              id: notification.notification_id,
              message: notification.message,
              type: notification.type,
              campaign_id: campaign.campaign_id,
              created_at: notification.created_at,
            });

            this.logger.log(
              `Sent ${notificationType} notification to user ${userId} for campaign ${campaign.campaign_id}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error checking upcoming campaigns:', error);
      throw handleError(error);
    }
  }

  async getUserNotifications(userId: string) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          campaign: {
            select: {
              name: true,
              brand: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      return await this.prisma.notification.update({
        where: {
          notification_id: notificationId,
          user_id: userId,
        },
        data: {
          status: 'READ',
        },
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  async simulateNotification() {
    try {
      const users = await this.prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { user_id: true },
      });

      const campaigns = await this.prisma.campaign.findMany({
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          brand: {
            select: { name: true },
          },
        },
      });

      if (campaigns.length === 0 || users.length === 0) {
        return;
      }

      const campaign = campaigns[0];
      const messages = [
        `New campaign "${campaign.name}" is trending!`,
        `Don't miss out on "${campaign.name}" by ${campaign.brand.name}!`,
        `Hot deal alert for "${campaign.name}"!`,
        `Special offer in "${campaign.name}" waiting for you!`,
      ];

      for (const user of users) {
        const randomMessage =
          messages[Math.floor(Math.random() * messages.length)];

        const notification = await this.prisma.notification.create({
          data: {
            user_id: user.user_id,
            campaign_id: campaign.campaign_id,
            message: randomMessage,
            type: NotificationType.CAMPAIGN_START_30MIN,
          },
        });

        await this.notificationEvents.sendNotification(user.user_id, {
          id: notification.notification_id,
          message: notification.message,
          type: notification.type,
          campaign_id: campaign.campaign_id,
          created_at: notification.created_at,
        });

        this.logger.log(`Sent simulation notification to user ${user.user_id}`);
      }
    } catch (error) {
      this.logger.error('Error sending simulation notification:', error);
      throw handleError(error);
    }
  }

  async markAllNotificationsAsRead(userId: string) {
    try {
      return await this.prisma.notification.updateMany({
        where: {
          user_id: userId,
          status: 'UNREAD',
        },
        data: {
          status: 'READ',
        },
      });
    } catch (error) {
      this.logger.error('Error marking all notifications as read:', error);
      throw handleError(error);
    }
  }
}
