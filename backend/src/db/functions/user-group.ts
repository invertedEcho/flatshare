import { eq } from 'drizzle-orm';
import { db } from '..';
import { groupInviteTable, groupTable, userGroupTable } from '../schema';

export async function dbGetGroupOfUser(userId: number) {
  const userGroups = await db
    .select()
    .from(userGroupTable)
    .where(eq(userGroupTable.userId, userId))
    .innerJoin(groupTable, eq(groupTable.id, userGroupTable.groupId))
    .limit(1);
  if (userGroups.length === 0) return undefined;
  return userGroups[0];
}

export async function dbGetInviteCode(inviteCode: string) {
  const inviteCodeRows = await db
    .select()
    .from(groupInviteTable)
    .where(eq(groupInviteTable.code, inviteCode))
    .limit(1);
  return inviteCodeRows[0];
}

export async function dbAddUserToGroup({
  userId,
  groupId,
}: {
  userId: number;
  groupId: number;
}) {
  await db.insert(userGroupTable).values({ userId, groupId });
}

export async function dbCreateUserGroup({ groupName }: { groupName: string }) {
  return await db.insert(groupTable).values({ name: groupName }).returning();
}
