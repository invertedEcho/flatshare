import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { SelectTask } from './db/schema';
import { dbCreateTask, dbGetAllTasks, dbUpdateTask } from './db/functions/task';

export type CreateTask = {
  title: string;
  description?: string;
  taskGroupId?: number;
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
