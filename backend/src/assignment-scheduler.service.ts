import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db } from './db';
import {
  dbGetAssignmentsForTaskGroup,
  dbGetCurrentAssignmentsForTaskGroup,
  dbGetTasksToAssignForCurrentInterval,
} from './db/functions/assignment';
import { dbGetTaskGroupUsers } from './db/functions/task-group';
import { assignmentTable } from './db/schema';
import { randomFromArray } from './utils/array';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const tasksToCreateAssignmentsFor =
      await dbGetTasksToAssignForCurrentInterval();

    console.debug(
      'Running task scheduling cron job for',
      tasksToCreateAssignmentsFor,
    );

    const tasksByGroup = tasksToCreateAssignmentsFor.reduce<
      Map<number, number[]>
    >((acc, curr) => {
      if (!acc.get(curr.taskGroupId)) {
        acc.set(curr.taskGroupId, []);
      }
      acc.get(curr.taskGroupId)?.push(curr.taskId);
      return acc;
    }, new Map());

    for (const [taskGroupId, taskIds] of tasksByGroup) {
      const userIds = await dbGetTaskGroupUsers(taskGroupId);
      if (userIds.length === 0) {
        continue;
      }

      const nextResponsibleUserId = await getNextResponsibleUserId(
        taskGroupId,
        userIds.map(({ userId }) => userId),
      );

      await db
        .insert(assignmentTable)
        .values(
          taskIds.map((taskId) => ({ taskId, userId: nextResponsibleUserId })),
        );
    }
  }
}

async function getNextResponsibleUserId(
  taskGroupId: number,
  userIds: number[],
) {
  const currentAssignments =
    await dbGetCurrentAssignmentsForTaskGroup(taskGroupId);

  /* If there already are current assignments, return the userId of one of the current assignments
   (It doesn't matter which one, they should all be assigned to the same user) */
  if (currentAssignments.length != 0) {
    return currentAssignments[0].assignment.userId;
  }

  const lastAssignments = await dbGetAssignmentsForTaskGroup(
    taskGroupId,
    userIds.length,
  );
  const userIdsWithoutAnyAssignments = userIds.filter(
    (userId) =>
      !lastAssignments.some(({ assignment }) => assignment.userId === userId),
  );

  /* If all users were already assigned the task, the next responsible user is the one who was assigned the task the longest ago.
    Otherwise it is randomly chosen from the users that were not assigned the task yet */
  if (userIdsWithoutAnyAssignments.length === 0) {
    return lastAssignments[lastAssignments.length - 1].assignment.userId;
  } else {
    return randomFromArray(userIdsWithoutAnyAssignments);
  }
}
