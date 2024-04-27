import { Controller, Get, Param } from '@nestjs/common';
import { dbGetAllTasks, dbGetTaskById } from './db/task';
import type { SelectTask } from './db/schema';

@Controller('tasks')
export class TasksController {
  @Get()
  async getAll(): Promise<SelectTask[]> {
    return await dbGetAllTasks();
  }

  @Get('/task')
  async getById(@Param('id') id: string): Promise<SelectTask> {
    return await dbGetTaskById(id);
  }
}
