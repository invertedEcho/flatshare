import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  dbGetTaskGroupUsers,
  dbGetTaskGroupsToCreateForCurrentInterval,
} from './db/functions/task-group';
import { dbGetAssignmentsForTaskGroup } from './db/functions/assignment-task-group';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const taskGroupsToCreateAssignmentsFor =
      await dbGetTaskGroupsToCreateForCurrentInterval();
    for (const { taskGroupId } of taskGroupsToCreateAssignmentsFor) {
      const users = await dbGetTaskGroupUsers(taskGroupId);
      const assignments = await dbGetAssignmentsForTaskGroup(
        taskGroupId,
        users.length,
      );
      console.log({ assignments });
    }
  }
}
