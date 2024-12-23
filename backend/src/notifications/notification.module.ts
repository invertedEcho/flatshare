import { Module } from '@nestjs/common';
import { NotificationSchedulerService } from './notification.service';

@Module({
  providers: [NotificationSchedulerService],
})
export class NotificationModule {}
