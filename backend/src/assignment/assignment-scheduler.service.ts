import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { dbInsertAssignments } from 'src/db/functions/assignment';
import { hydrateTaskGroupsToAssignToAssignments } from './util';
import { dbGetTaskGroupsToAssignForCurrentInterval } from 'src/db/functions/task-group';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class AssignmentSchedulerService {
  // TODO: optimally, this is not run this often, but just once in a day, and on task creation we immediately create assignments as needed.
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCreateAssignmentsCron() {
    const message = {
      title: 'dude get up do your task',
      body: 'you need to vacuum.',
    };

    const result = await getMessaging().send({
      notification: message,
      topic: 'assignments-1',
      // token:
      //   'f_WDIHr7SO-lUbC-BPJZw1:APA91bGjzWYpPlzdaG9i8tead5MbULsPIFA9mUlGA6w__Q9ODpR38YKBUslCPQ0deXPrvymsu9W1ZnG2GPVK5Oi8reQILU7JW6wRC53kym_BerD5sjX4AL0',
    });

    console.log({ result, loc: 'test' });
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
