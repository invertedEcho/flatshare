import { Controller, Get } from '@nestjs/common';
import { dbGetAllTasks } from './db/task';
import { SelectTask } from './db/schema';

@Controller('tasks')
export class TasksController {
  @Get()
  async getAll(): Promise<SelectTask[]> {
    return await dbGetAllTasks();
  }
}
