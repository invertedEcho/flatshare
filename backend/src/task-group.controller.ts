import { Controller, Get } from '@nestjs/common';
import { dbGetTaskGroups } from './db/functions/task-group';

@Controller('task-groups')
export class TaskGroupsController {
  @Get()
  async getTaskGroups() {
    const taskGroups = await dbGetTaskGroups();
    return taskGroups;
  }
}
