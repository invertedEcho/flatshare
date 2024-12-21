import { Cron, CronExpression } from '@nestjs/schedule';
import { dbGetFCMRegistrationTokens } from 'src/db/functions/notification';
import { getMessaging } from 'firebase-admin/messaging';

export class NotificationSchedulerService {
  @Cron('0 8 * * 1')
  async handleSendNotificationStartOfWeek() {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleDebugNotifications() {
    console.log('EVERY 30 seconds');

    const messaging = getMessaging();

    const tokens = await dbGetFCMRegistrationTokens();
    for (const token of tokens) {
      // messaging.send({
      //   notification: {
      //     title: 'Reminder - Assignment',
      //     body: "Don't forget to vacuum!",
      //   },
      //   token: token.fcmRegistrationToken,
      // });
      console.log({ token });
    }
  }
}
