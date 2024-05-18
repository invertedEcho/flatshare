import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';
import { AssignmentController } from './assignment.controller';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TaskGroupsController } from './task-group.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    TasksController,
    AssignmentController,
    AuthController,
    TaskGroupsController,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
