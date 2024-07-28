import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  dbAddUserToUserGroup,
  dbCreateUserGroup,
  dbGetUserGroupOfUser,
  dbGetUserGroupByInviteCode,
  dbGetUserGroup,
} from './db/functions/user-group';
import { db } from './db';
import {
  userGroupInviteTable,
  userTable,
  userUserGroupTable,
} from './db/schema';
import { generateRandomAlphanumericalCode } from './utils/random';
import { eq } from 'drizzle-orm';

@Controller('user-group')
export class UserGroupController {
  // TODO: we need to support multiple user groups
  @Get(':userId')
  async getGroupOfUser(@Param('userId') userId: number) {
    const userGroup = await dbGetUserGroupOfUser(userId);
    return {
      id: userGroup?.user_user_group.groupId ?? null,
      name: userGroup?.user_group.name ?? null,
    };
  }

  @Post('join')
  async joinGroup(@Body() body: { userId: number; inviteCode: string }) {
    const { inviteCode, userId } = body;
    const maybeInviteCode = await dbGetUserGroupByInviteCode(inviteCode);

    if (maybeInviteCode === undefined) {
      throw new HttpException(
        'The specified invite code was not found.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await dbAddUserToUserGroup({ userId, groupId: maybeInviteCode.groupId });

    const userGroup = await dbGetUserGroup({
      userGroupId: maybeInviteCode.groupId,
    });
    return userGroup;
  }

  @Post('join-by-id')
  async joinGroupById(@Body() body: { userId: number; groupId: number }) {
    const { groupId, userId } = body;
    await dbAddUserToUserGroup({ userId, groupId });
    return { success: true, groupId };
  }

  @Post('create')
  async createGroup(@Body() body: { groupName: string }) {
    const { groupName } = body;
    return (await dbCreateUserGroup({ groupName }))[0];
  }

  @Get('invite-code/:groupId')
  async generateInviteCode(@Param('groupId') groupId: number) {
    // const group = (
    //   await db
    //     .select()
    //     .from(groupTable)
    //     .where(eq(groupTable.id, groupId))
    //     .limit(1)
    // )[0];

    const inviteCode = generateRandomAlphanumericalCode(6);
    await db.insert(userGroupInviteTable).values({ code: inviteCode, groupId });

    return { inviteCode };
  }

  @Get(':userGroupId/users')
  async getUsers(@Param('userGroupId') userGroupId: number) {
    console.log({ userGroupId });
    return await db
      .select({
        userId: userTable.id,
        email: userTable.email,
        username: userTable.username,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .innerJoin(
        userUserGroupTable,
        eq(userUserGroupTable.userId, userTable.id),
      )
      .where(eq(userUserGroupTable.groupId, userGroupId));
  }
}
