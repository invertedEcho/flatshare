import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import {
  dbDeleteTaskGroup,
  dbGetTaskGroups,
} from 'src/db/functions/recurring-task-group';

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

  @Delete(':taskGroupId')
  async deleteTaskGroup(@Param('taskGroupId') taskGroupId: number) {
    await dbDeleteTaskGroup(taskGroupId);
  }
}
