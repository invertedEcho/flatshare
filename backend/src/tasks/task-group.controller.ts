import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  dbCreateTaskGroup,
  dbGetTaskGroups,
} from 'src/db/functions/task-group';

export type CreateTaskGroup = {
  title: string;
  description?: string;
  interval: string;
  userIds: number[];
  initialStartDate: string;
  userGroupId: number;
};

@Controller('task-group')
export class TaskGroupController {
  @Get()
  async getTaskGroups(@Query('userGroupId') userGroupId: number) {
    const taskGroups = await dbGetTaskGroups({ userGroupId });
    return taskGroups;
  }

  @Post()
  async createTaskGroup(@Body() taskGroup: CreateTaskGroup) {
    if (taskGroup.userIds.length === 0) {
      throw new HttpException(
        'userIds field must contain one or more values',
        HttpStatus.BAD_REQUEST,
      );
    }
    await dbCreateTaskGroup(taskGroup);
  }
}
