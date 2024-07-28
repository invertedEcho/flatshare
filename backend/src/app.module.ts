import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
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
})
export class AppModule {}
