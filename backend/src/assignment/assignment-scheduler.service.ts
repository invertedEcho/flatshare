import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  dbInsertAssignments,
  dbGetRecurringTaskGroupsToAssignForCurrentInterval,
} from 'src/db/functions/assignment';
import { hydrateRecurringTaskGroupsToAssignToAssignments } from './util';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCreateAssignmentsCron() {
    const recurringTaskGroupsToAssign =
      await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
        overrideNow: undefined,
      });

    const assignmentsToCreate = hydrateRecurringTaskGroupsToAssignToAssignments(
      recurringTaskGroupsToAssign,
    );

    if (assignmentsToCreate.length > 0) {
      await dbInsertAssignments({ assignments: assignmentsToCreate });
      console.info(`Created new assignments: ${assignmentsToCreate}`);
    }
  }
}
