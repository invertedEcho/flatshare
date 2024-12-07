import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { dbInsertAssignments } from 'src/db/functions/assignment';
import { hydrateTaskGroupsToAssignToAssignments } from './util';
import { dbGetTaskGroupsToAssignForCurrentInterval } from 'src/db/functions/task-group';

@Injectable()
export class AssignmentSchedulerService {
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
