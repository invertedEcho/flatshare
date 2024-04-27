import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';

@Module({
  imports: [],
  controllers: [TasksController],
})
export class AppModule {}
