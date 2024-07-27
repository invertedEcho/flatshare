import { eq } from 'drizzle-orm';
import { db } from '..';
import { userTable } from '../schema';

export async function dbGetUserById(userId: number) {
  return (await db.select().from(userTable).where(eq(userTable.id, userId)))[0];
}

export async function dbGetUserByEmail(email: string) {
  const res = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);
  return res[0];
}
