import { Body, Controller, Get, Post } from '@nestjs/common';
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
};

@Controller('task-group')
export class TaskGroupController {
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
