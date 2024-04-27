import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';
import { AssignmentController } from './assignment.controller';

@Module({
  imports: [],
  controllers: [TasksController, AssignmentController],
  providers: [],
})
export class AppModule {}
