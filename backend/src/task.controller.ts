import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  dbCreateTask,
  dbCreateTaskGroup,
  dbGetAllTasks,
  dbUpdateTask,
} from './db/task';
import { SelectTask } from './db/schema';

export type CreateTask = {
  title: string;
  description?: string;
  taskGroupId?: number;
};

export type CreateTaskGroup = {
  title: string;
  description?: string;
  intervalDays: number;
  userIds: number[];
  initialStartDate: string;
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

  @Post('taskGroup')
  async createTaskGroup(@Body() taskGroup: CreateTaskGroup) {
    console.log({ taskGroup });
    await dbCreateTaskGroup(taskGroup);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() task: UpdateTask) {
    console.log({ updatedTask: task });
    await dbUpdateTask({ ...task, id: Number(id) });
  }
}
