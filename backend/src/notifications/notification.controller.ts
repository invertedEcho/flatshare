import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { userFcmRegistrationTokenMappingTable } from 'src/db/schema';

@Controller('notifications')
export class NotificationController {
  @Post('registration-token')
  async postRegistrationToken(
    @Body()
    {
      userId,
      registrationToken,
    }: {
      userId: number;
      registrationToken: string;
    },
  ) {
    try {
      await db
        .insert(userFcmRegistrationTokenMappingTable)
        .values({ userId, fcmRegistrationToken: registrationToken })
        .onConflictDoUpdate({
          target: [
            userFcmRegistrationTokenMappingTable.userId,
            userFcmRegistrationTokenMappingTable.fcmRegistrationToken,
          ],
          set: { updatedAt: sql`now()` },
        });
    } catch (error) {
      console.error({ error });
      throw new HttpException(
        `Failed to post registration token: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
