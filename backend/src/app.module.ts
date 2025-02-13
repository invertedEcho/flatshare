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
import { EventsGateway } from './shopping-list/events.gateway';
import { ShoppingListController } from './shopping-list/shopping-list.controller';
import { NotificationController } from './notifications/notification.controller';
import { NotificationModule } from './notifications/notification.module';
import { ExpenseItemController } from './expense-item/expense-item.controller';

const rootPathStatic = join(__dirname, '../../src/client/public/');

@Module({
  imports: [
    AuthModule,
    // needed to active job scheduling from @nestjs/schedule
    ScheduleModule.forRoot(),
    AssignmentsModule,
    NotificationModule,
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
    ShoppingListController,
    NotificationController,
    ExpenseItemController,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
