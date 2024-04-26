import { Controller, Get, Param } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  @Get()
  getAll(): string[] {
    return ['task 1', 'task 2'];
  }

  @Get()
  getById(@Param('id') id: string): string {
    return `a single task by a specific id, ${id}`;
  }
}
