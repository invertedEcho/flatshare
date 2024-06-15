import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  dbCreateOneOffTask,
  dbCreateRecurringTask,
  dbGetAllTasks,
  dbUpdateTask,
} from 'src/db/functions/task';
import { SelectTask } from 'src/db/schema';

export type CreateTask = {
  title: string;
  description?: string;
  taskGroupId?: number;
};

// TODO: extra type for this feels weird
export type OneOffTask = {
  title: string;
  description: string;
  userIds: number[];
};

// TODO: this shouldnt be a seperate type
export type UpdateTask = {
  title: string;
  description: string;
  taskGroupId?: number;
};

@Controller('tasks')
export class TasksController {
  @Get()
  async getAll(): Promise<SelectTask[]> {
    const tasks = await dbGetAllTasks();
    return tasks;
  }

  @Post('/recurring')
  async createRecurringTask(@Body() task: CreateTask) {
    await dbCreateRecurringTask(task);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() task: UpdateTask) {
    await dbUpdateTask({ ...task, id: Number(id) });
  }

  @Post('/one-off')
  async createOneOffTask(@Body() oneOffTask: OneOffTask) {
    await dbCreateOneOffTask(oneOffTask);
  }
}
