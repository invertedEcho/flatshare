import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { db } from 'src/db';
import {
  dbCreateTaskGroup,
  dbGetTaskGroups,
  dbGetTasksOfTaskGroup,
} from 'src/db/functions/task-group';
import {
  assignmentTable,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from 'src/db/schema';

export type CreateTaskGroup = {
  title: string;
  description?: string;
  interval: string;
  userIds: number[];
  initialStartDate: string;
  userGroupId: number;
};

@Controller('task-group')
export class TaskGroupController {
  @Get()
  async getTaskGroups(@Query('userGroupId') userGroupId: number) {
    const taskGroups = await dbGetTaskGroups({ userGroupId });
    return taskGroups;
  }

  // TODO: this endpoint should be protected, only users with the correct groupId should be able to fetch this
  @Get('/tasks/:taskGroupId')
  async getTasksForTaskGroup(@Param('taskGroupId') taskGroupId: number) {
    const tasks = await dbGetTasksOfTaskGroup(taskGroupId);
    return tasks;
  }

  @Post()
  async createTaskGroup(@Body() taskGroup: CreateTaskGroup) {
    if (taskGroup.userIds.length === 0) {
      throw new HttpException(
        'userIds field must contain one or more values',
        HttpStatus.BAD_REQUEST,
      );
    }
    await dbCreateTaskGroup(taskGroup);
  }

  @Delete(':taskGroupId')
  async deleteTaskGroup(@Param('taskGroupId') taskGroupId: number) {
    await db
      .delete(recurringTaskGroupUserTable)
      .where(eq(recurringTaskGroupUserTable.recurringTaskGroupId, taskGroupId));
    const taskIds = (await dbGetTasksOfTaskGroup(taskGroupId)).map(
      (task) => task.id,
    );
    if (taskIds.length > 0) {
      await db
        .delete(assignmentTable)
        .where(inArray(assignmentTable.taskId, taskIds));
      await db
        .delete(taskUserGroupTable)
        .where(inArray(taskUserGroupTable.taskId, taskIds));
      await db.delete(taskTable).where(inArray(taskTable.id, taskIds));
    }
    await db
      .delete(recurringTaskGroupTable)
      .where(eq(recurringTaskGroupTable.id, taskGroupId));
  }
}
