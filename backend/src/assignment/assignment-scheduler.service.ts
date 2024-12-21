import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { dbInsertAssignments } from 'src/db/functions/assignment';
import { hydrateTaskGroupsToAssignToAssignments } from './util';
import { dbGetTaskGroupsToAssignForCurrentInterval } from 'src/db/functions/task-group';
import { dbGetFCMRegistrationTokensByUserIds } from 'src/db/functions/notification';
import { sendFirebaseMessages } from 'src/notifications/notification';
import { Message } from 'firebase-admin/messaging';

@Injectable()
export class AssignmentSchedulerService {
  // TODO: optimally, this is not run this often, but just once in a day, and on task creation we immediately create assignments as needed.
  @Cron(CronExpression.EVERY_30_SECONDS)
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

      if (process.env.CI === 'true') {
        return;
      }

      const userIds = assignmentsToCreate.map(
        (assignment) => assignment.userId,
      );
      const tokens = await dbGetFCMRegistrationTokensByUserIds(userIds);
      const messages = tokens.map((token) => {
        return {
          token,
          notification: {
            title: '🚀 New Task Assigned!',
            body: "You have a new assignment waiting for you! Click to learn more. Let's get it done!",
          },
        } satisfies Message;
      });
      await sendFirebaseMessages({ messages });
      console.log({ loc: 'Sent firebase messages', messages });
    }
  }
}
