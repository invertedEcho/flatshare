import { eq } from 'drizzle-orm';
import { db } from '..';
import {
  userGroupInviteTable,
  userGroupTable,
  userUserGroupTable,
} from '../schema';

export async function dbGetGroupOfUser(userId: number) {
  const userGroups = await db
    .select()
    .from(userUserGroupTable)
    .where(eq(userUserGroupTable.userId, userId))
    .innerJoin(
      userGroupTable,
      eq(userGroupTable.id, userUserGroupTable.groupId),
    )
    .limit(1);
  if (userGroups.length === 0) return undefined;
  return userGroups[0];
}

export async function dbGetInviteCode(inviteCode: string) {
  const inviteCodeRows = await db
    .select()
    .from(userGroupInviteTable)
    .where(eq(userGroupInviteTable.code, inviteCode))
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
  await db.insert(userUserGroupTable).values({ userId, groupId });
}

export async function dbCreateUserGroup({ groupName }: { groupName: string }) {
  return await db
    .insert(userGroupTable)
    .values({ name: groupName })
    .returning();
}
