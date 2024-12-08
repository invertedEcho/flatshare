import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { dbInsertAssignments } from 'src/db/functions/assignment';
import { hydrateTaskGroupsToAssignToAssignments } from './util';
import { dbGetTaskGroupsToAssignForCurrentInterval } from 'src/db/functions/task-group';

@Injectable()
export class AssignmentSchedulerService {
  // TODO: optimally, this is not run this often, but just once in a day, and on task creation we immediately create assignments as needed.
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCreateAssignmentsCron() {
    const taskGroupsToAssign = await dbGetTaskGroupsToAssignForCurrentInterval({
      overrideNow: undefined,
    });

    if (taskGroupsToAssign.length === 0) {
      return;
    }

    const assignmentsToCreate = await hydrateTaskGroupsToAssignToAssignments(
      taskGroupsToAssign,
    );

    if (assignmentsToCreate.length > 0) {
      await dbInsertAssignments({ assignments: assignmentsToCreate });
      console.info(
        `Created new assignments: ${JSON.stringify(
          assignmentsToCreate,
          null,
          2,
        )}`,
      );
    }
  }
}
