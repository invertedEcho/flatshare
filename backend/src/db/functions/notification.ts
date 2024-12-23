import { inArray } from 'drizzle-orm';
import { db } from '..';
import { userFcmRegistrationTokenMappingTable } from '../schema';

export async function dbGetFCMRegistrationTokensByUserIds(userIds: number[]) {
  const result = await db
    .select({
      token: userFcmRegistrationTokenMappingTable.fcmRegistrationToken,
    })
    .from(userFcmRegistrationTokenMappingTable)
    .where(inArray(userFcmRegistrationTokenMappingTable.userId, userIds));
  return result.map((row) => row.token);
}
