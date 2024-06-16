import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserGroupController } from './user-group.controller';
import { AssignmentsModule } from './assignment/assignment.module';
import { TasksController } from './tasks/task.controller';
import { AssignmentController } from './assignment/assignment.controller';
import { TaskGroupController } from './tasks/task-group.controller';

const rootPathStatic = join(__dirname, '../../src/client/public/');

@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    AssignmentsModule,
    ServeStaticModule.forRoot({
      rootPath: rootPathStatic,
      exclude: ['/api/(.*)'],
    }),
  ],
  controllers: [
    TasksController,
    AssignmentController,
    AuthController,
    TaskGroupController,
    UserGroupController,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
