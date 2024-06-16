import { eq } from 'drizzle-orm';
import { db } from '..';
import { userTable } from '../schema';

export async function dbGetUserById(userId: number) {
  return (await db.select().from(userTable).where(eq(userTable.id, userId)))[0];
}

// TODO: This shouldnt exist. A username is not unique
export async function findUserByName(username: string) {
  const res = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))
    .limit(1);
  return res[0];
}
