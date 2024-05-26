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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserGroupController } from './user-group.controller';

const rootPathStatic = join(__dirname, '../../src/client/public/');

@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    AssignmentsModule,
    ServeStaticModule.forRoot({
      rootPath: rootPathStatic,
      // TODO: What exactly does this?
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
