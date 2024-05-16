import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { dbCreateTask, dbGetAllTasks, dbUpdateTask } from './db/task';
import { SelectTask } from './db/schema';

export type CreateTask = {
  title: string;
  description?: string;
  taskGroupId?: number;
  // intervalType: 'hours' | 'days' | 'weeks';
  // intervalValue: number;
};

// todo: this shouldnt be a seperate type
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
    console.log({ tasks });
    return tasks;
  }

  @Post()
  async createTask(@Body() task: CreateTask) {
    console.log({ task });
    await dbCreateTask(task);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() task: UpdateTask) {
    console.log({ updatedTask: task });
    await dbUpdateTask({ ...task, id: Number(id) });
  }
}
