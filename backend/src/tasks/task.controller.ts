import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  dbCreateOneOffTask,
  dbCreateRecurringTask,
  dbDeleteTask,
  dbGetAllTasks,
  dbUpdateTask,
} from 'src/db/functions/task';
import { InsertTask, SelectTask } from 'src/db/schema';

// TODO: make a base type for these three types below
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
  // TODO: should be optional, query param
  async getAll(@Query('groupId') groupId: number): Promise<SelectTask[]> {
    const tasks = await dbGetAllTasks({ groupId });
    return tasks;
  }

  @Post('/recurring')
  async createRecurringTask(@Body() task: InsertTask & { groupId: number }) {
    await dbCreateRecurringTask(task);
  }

  @Post('/one-off')
  async createOneOffTask(@Body() oneOffTask: OneOffTask & { groupId: number }) {
    if (Object.keys(oneOffTask).length === 0) {
      throw new BadRequestException();
    }
    await dbCreateOneOffTask(oneOffTask);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() task: UpdateTask) {
    await dbUpdateTask({ ...task, id: Number(id) });
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: number) {
    await dbDeleteTask({ taskId: id });
  }
}
