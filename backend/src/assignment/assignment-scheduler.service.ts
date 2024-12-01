import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { dbInsertAssignments } from 'src/db/functions/assignment';
import { hydrateRecurringTaskGroupsToAssignToAssignments } from './util';
import { dbGetRecurringTaskGroupsToAssignForCurrentInterval } from 'src/db/functions/recurring-task-group';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCreateAssignmentsCron() {
    const recurringTaskGroupsToAssign =
      await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
        overrideNow: undefined,
      });

    if (recurringTaskGroupsToAssign.length === 0) {
      return;
    }

    const assignmentsToCreate =
      await hydrateRecurringTaskGroupsToAssignToAssignments(
        recurringTaskGroupsToAssign,
      );

    if (assignmentsToCreate.length > 0) {
      await dbInsertAssignments({ assignments: assignmentsToCreate });
      console.info(
        `Created new assignments: ${JSON.stringify(assignmentsToCreate, null, 2)}`,
      );
    }
  }
}
