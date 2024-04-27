import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [],
})
export class AppModule {}
