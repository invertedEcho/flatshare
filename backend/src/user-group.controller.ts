import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  dbAddUserToGroup,
  dbGetGroupOfUser,
  dbGetInviteCode,
} from './db/functions/user-group';

@Controller('user-group')
export class UserGroupController {
  @Get(':userId')
  async getGroupOfUser(@Param('userId') userId: number) {
    const userGroupId = await dbGetGroupOfUser(userId);
    return {
      userGroupId: userGroupId?.group.id ?? null,
      name: userGroupId?.group.name ?? null,
    };
  }

  @Post('join')
  async joinGroup(@Body() body: { userId: number; inviteCode: number }) {
    const { inviteCode, userId } = body;
    const maybeInviteCode = await dbGetInviteCode(inviteCode);
    if (maybeInviteCode === undefined) {
      return { success: false };
    }
    await dbAddUserToGroup({ userId, groupId: maybeInviteCode.groupId });
    return { success: true };
  }
}
