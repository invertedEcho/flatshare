import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';
import { AssignmentController } from './AssignmentController';

@Module({
  imports: [],
  controllers: [TasksController, AssignmentController],
  providers: [],
})
export class AppModule {}
