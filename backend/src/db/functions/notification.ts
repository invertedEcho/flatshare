import { db } from '..';
import { userFcmRegistrationTokenMappingTable } from '../schema';

export async function dbGetFCMRegistrationTokens() {
  return await db.select().from(userFcmRegistrationTokenMappingTable);
}
