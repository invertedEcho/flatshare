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
import { SelectTask } from 'src/db/schema';
import {
  DefaultDisplayInterval,
  displayIntervalToPostgresInterval,
} from 'src/utils/interval';

export type BaseTask = {
  title: string;
  description?: string;
};

export type OneOffTask = {
  userIds: number[];
} & BaseTask;

export type UpdateTask = {
  taskGroupId?: number;
} & BaseTask;

export type CreateRecurringTaskBody = {
  interval: DefaultDisplayInterval;
  userGroupId: number;
} & BaseTask;

@Controller('tasks')
export class TasksController {
  @Get()
  // TODO: should be optional, query param
  async getAll(
    @Query('userGroupId') userGroupId: number,
  ): Promise<SelectTask[]> {
    const tasks = await dbGetAllTasks({ userGroupId });
    return tasks;
  }

  @Post('/recurring')
  async createRecurringTask(@Body() recurringTask: CreateRecurringTaskBody) {
    const formattedInterval =
      displayIntervalToPostgresInterval[recurringTask.interval];

    const task = await dbCreateRecurringTask({
      ...recurringTask,
      interval: formattedInterval,
    });
    return task;
  }

  @Post('/one-off')
  async createOneOffTask(@Body() oneOffTask: OneOffTask & { groupId: number }) {
    if (Object.keys(oneOffTask).length === 0) {
      throw new BadRequestException();
    }
    const task = await dbCreateOneOffTask(oneOffTask);
    return task;
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
