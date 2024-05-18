import { Body, Controller, Get, Post } from '@nestjs/common';
import { dbCreateTaskGroup, dbGetTaskGroups } from './db/functions/task-group';

export type CreateTaskGroup = {
  title: string;
  description?: string;
  intervalDays: string;
  userIds: number[];
  initialStartDate: string;
};

@Controller('task-group')
export class TaskGroupsController {
  @Get()
  async getTaskGroups() {
    const taskGroups = await dbGetTaskGroups();
    return taskGroups;
  }

  @Post()
  async createTaskGroup(@Body() taskGroup: CreateTaskGroup) {
    console.log({ taskGroup });
    await dbCreateTaskGroup(taskGroup);
  }
}
