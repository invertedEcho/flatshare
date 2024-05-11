import { Body, Controller, Get, Post } from '@nestjs/common';
import { dbCreateTask, dbGetAllTasks } from './db/task';
import { SelectTask } from './db/schema';

export type CreateTask = {
  title: string;
  description?: string;
  intervalType: 'hours' | 'days' | 'weeks';
  intervalValue: number;
};

@Controller('tasks')
export class TasksController {
  @Get()
  async getAll(): Promise<SelectTask[]> {
    const allTasks = await dbGetAllTasks();
    console.log({ allTasks });
    return allTasks;
  }

  @Post()
  async createTask(@Body() task: CreateTask) {
    console.log({ task });
    await dbCreateTask(task);
  }
}
