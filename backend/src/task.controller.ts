import { Controller, Get } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  @Get()
  async getAll(): Promise<string[]> {
    return ['task 1'];
  }
}
