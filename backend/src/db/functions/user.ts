import { eq } from 'drizzle-orm';
import { db } from '..';
import { userTable } from '../schema';

export async function findUserByName(username: string) {
  const res = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))
    .limit(1);
  return res[0];
}
