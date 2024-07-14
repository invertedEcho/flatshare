import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  dbAddUserToGroup,
  dbCreateUserGroup,
  dbGetGroupOfUser,
  dbGetInviteCode,
} from './db/functions/user-group';
import { db } from './db';
import { userGroupInviteTable } from './db/schema';

function generateRandomAlphanumericalCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

@Controller('user-group')
export class UserGroupController {
  @Get(':userId')
  async getGroupOfUser(@Param('userId') userId: number) {
    const userGroup = await dbGetGroupOfUser(userId);
    return {
      userGroupId: userGroup?.user_user_group.groupId ?? null,
      name: userGroup?.user_group.name ?? null,
    };
  }

  // TODO: returning success should not be needed. the response status should just not be status 2xx.
  @Post('join')
  async joinGroup(@Body() body: { userId: number; inviteCode: string }) {
    const { inviteCode, userId } = body;
    const maybeInviteCode = await dbGetInviteCode(inviteCode);
    if (maybeInviteCode === undefined) {
      return { success: false, groupId: null };
    }
    await dbAddUserToGroup({ userId, groupId: maybeInviteCode.groupId });
    return { success: true, groupId: maybeInviteCode.groupId };
  }

  @Post('join-by-id')
  async joinGroupById(@Body() body: { userId: number; groupId: number }) {
    const { groupId, userId } = body;
    await dbAddUserToGroup({ userId, groupId });
    return { success: true, groupId };
  }

  @Post('create')
  async createGroup(@Body() body: { groupName: string }) {
    const { groupName } = body;
    return (await dbCreateUserGroup({ groupName }))[0];
  }

  // TODO: yeaaahhh we definitely need to protect this route.
  @Get('invite-code/:groupId')
  async generateInviteCode(@Param('groupId') groupId: number) {
    // const group = (
    //   await db
    //     .select()
    //     .from(groupTable)
    //     .where(eq(groupTable.id, groupId))
    //     .limit(1)
    // )[0];

    const inviteCode = generateRandomAlphanumericalCode(8);
    await db.insert(userGroupInviteTable).values({ code: inviteCode, groupId });

    return { inviteCode };
  }
}
