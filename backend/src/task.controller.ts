import { Body, Controller, Get, Post } from '@nestjs/common';
import { dbCreateTask, dbGetAllTasks } from './db/task';
import { InsertTask, SelectTask } from './db/schema';

@Controller('tasks')
export class TasksController {
  @Get()
  async getAll(): Promise<SelectTask[]> {
    const allTasks = await dbGetAllTasks();
    console.log({ allTasks });
    return allTasks;
  }

  @Post()
  async createTask(@Body() task: InsertTask) {
    console.log({ task });
    await dbCreateTask(task);
  }
}
