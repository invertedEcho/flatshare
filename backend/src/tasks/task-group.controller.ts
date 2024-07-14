import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  dbCreateTaskGroup,
  dbGetTaskGroups,
} from 'src/db/functions/task-group';

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

  @Post()
  async createTaskGroup(@Body() taskGroup: CreateTaskGroup) {
    await dbCreateTaskGroup(taskGroup);
  }
}
