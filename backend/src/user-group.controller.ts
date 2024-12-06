import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from './db';
import {
  dbAddUserToUserGroup,
  dbCreateUserGroup,
  dbGetUserGroup,
  dbGetUserGroupByInviteCode,
  dbGetUserGroupOfUser,
} from './db/functions/user-group';
import {
  taskGroupUserMappingTable,
  userGroupInviteTable,
  userTable,
  userUserGroupMappingTable,
} from './db/schema';
import { generateRandomAlphanumericalCode } from './utils/random';
import {
  dbGetHighestAssignmentOrdinalForTaskGroup,
  dbGetTaskGroupsOfUserGroup,
} from './db/functions/task-group';

@Controller('user-group')
export class UserGroupController {
  @Get()
  async getUserGroupOfUser(@Query('userId') userId: number) {
    const userGroup = await dbGetUserGroupOfUser(userId);
    return {
      id: userGroup?.user_user_group_mapping.userGroupId ?? null,
      name: userGroup?.user_group.name ?? null,
    };
  }

  @Post('join-by-invite-code')
  async joinGroup(@Body() body: { userId: number; inviteCode: string }) {
    const { inviteCode, userId } = body;
    const maybeInviteCode = await dbGetUserGroupByInviteCode(inviteCode);

    if (maybeInviteCode === undefined) {
      throw new HttpException(
        'The specified invite code was not found.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await dbAddUserToUserGroup({
      userId,
      userGroupId: maybeInviteCode.userGroupId,
    });

    const taskGroupsOfUserGroup = await dbGetTaskGroupsOfUserGroup({
      userGroupId: maybeInviteCode.userGroupId,
    });

    const values = await Promise.all(
      taskGroupsOfUserGroup.map(async (taskGroup) => ({
        taskGroupId: taskGroup.id,
        userId,
        assignmentOrdinal:
          ((await dbGetHighestAssignmentOrdinalForTaskGroup({
            taskGroupId: taskGroup.id,
          })) ?? 0) + 1,
      })),
    );

    if (values.length > 0) {
      await db.insert(taskGroupUserMappingTable).values(values);
    }

    const userGroup = await dbGetUserGroup({
      userGroupId: maybeInviteCode.userGroupId,
    });
    return userGroup;
  }

  @Post('join-by-id')
  async joinGroupById(@Body() body: { userId: number; userGroupId: number }) {
    const { userGroupId, userId } = body;
    await dbAddUserToUserGroup({ userId, userGroupId });
    return { success: true, userGroupId };
  }

  @Post('create')
  async createGroup(@Body() body: { groupName: string }) {
    const { groupName } = body;
    return (await dbCreateUserGroup({ groupName }))[0];
  }

  @Get('invite-code/:userGroupId')
  async generateInviteCode(@Param('userGroupId') userGroupId: number) {
    const inviteCode = generateRandomAlphanumericalCode(6);
    await db
      .insert(userGroupInviteTable)
      .values({ code: inviteCode, userGroupId });

    return { inviteCode };
  }

  @Get('users')
  async getUsers(@Query('userGroupId') userGroupId: number) {
    return await db
      .select({
        userId: userTable.id,
        email: userTable.email,
        username: userTable.username,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .innerJoin(
        userUserGroupMappingTable,
        eq(userUserGroupMappingTable.userId, userTable.id),
      )
      .where(eq(userUserGroupMappingTable.userGroupId, userGroupId));
  }
}
