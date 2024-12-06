import { eq } from 'drizzle-orm';
import { db } from '..';
import {
  userGroupInviteTable,
  userGroupTable,
  userUserGroupMappingTable,
} from '../schema';

export async function dbGetUserGroupOfUser(userId: number) {
  const userGroups = await db
    .select()
    .from(userUserGroupMappingTable)
    .where(eq(userUserGroupMappingTable.userId, userId))
    .innerJoin(
      userGroupTable,
      eq(userGroupTable.id, userUserGroupMappingTable.userGroupId),
    )
    .limit(1);
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
  userGroupId,
}: {
  userId: number;
  userGroupId: number;
}) {
  await db.insert(userUserGroupMappingTable).values({ userId, userGroupId });
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
    .from(userUserGroupMappingTable)
    .where(eq(userUserGroupMappingTable.userGroupId, userGroupId));
}
