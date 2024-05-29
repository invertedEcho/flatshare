import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  dbAddUserToGroup,
  dbGetGroupOfUser,
  dbGetInviteCode,
} from './db/functions/user-group';
import { db } from './db';
import { groupInviteTable } from './db/schema';

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
    const userGroupId = await dbGetGroupOfUser(userId);
    return {
      userGroupId: userGroupId?.group.id ?? null,
      name: userGroupId?.group.name ?? null,
    };
  }

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
    console.log({ inviteCode });
    await db.insert(groupInviteTable).values({ code: inviteCode, groupId });

    return { inviteCode };
  }
}
