import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    {
      provide: 'NOTIFICATION_EVENTS',
      useExisting: NotificationsGateway,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
