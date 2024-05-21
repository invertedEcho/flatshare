import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';
import { AssignmentController } from './assignment.controller';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TaskGroupController } from './task-group.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AssignmentsModule } from './assignment.module';

@Module({
  imports: [AuthModule, ScheduleModule.forRoot(), AssignmentsModule],
  controllers: [
    TasksController,
    AssignmentController,
    AuthController,
    TaskGroupController,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
