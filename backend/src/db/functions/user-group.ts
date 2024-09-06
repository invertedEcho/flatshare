import { eq } from 'drizzle-orm';
import { db } from '..';
import {
  recurringTaskGroupTable,
  userGroupInviteTable,
  userGroupTable,
  userUserGroupTable,
} from '../schema';

export async function dbGetUserGroupOfUser(userId: number) {
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

export async function dbGetUserGroupByInviteCode(inviteCode: string) {
  const inviteCodeRows = await db
    .select()
    .from(userGroupInviteTable)
    .where(eq(userGroupInviteTable.code, inviteCode))
    .limit(1);
  return inviteCodeRows[0];
}

export async function dbAddUserToUserGroup({
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

export async function dbGetUserGroup({ userGroupId }: { userGroupId: number }) {
  return (
    await db
      .select()
      .from(userGroupTable)
      .where(eq(userGroupTable.id, userGroupId))
      .limit(1)
  )[0];
}

export async function dbGetUsersOfUserGroup({
  userGroupId,
}: {
  userGroupId: number;
}) {
  return await db
    .select()
    .from(userUserGroupTable)
    .where(eq(userUserGroupTable.groupId, userGroupId));
}

export async function dbGetRecurringTaskGroupsOfUserGroup({
  userGroupId,
}: {
  userGroupId: number;
}) {
  return await db
    .select()
    .from(recurringTaskGroupTable)
    .where(eq(recurringTaskGroupTable.userGroupId, userGroupId));
}
