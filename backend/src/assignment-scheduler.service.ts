import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import {
  dbGetAssignmentsForTaskGroup,
  dbGetTasksToAssignForCurrentInterval,
} from './db/functions/assignment';
import { dbGetTaskGroupUsers } from './db/functions/task-group';
import { assignmentTable, taskGroupTable, taskTable } from './db/schema';
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
      Record<string, number[]>
    >((acc, curr) => {
      if (!acc[curr.taskGroupId]) {
        acc[curr.taskGroupId] = [];
      }
      acc[curr.taskGroupId].push(curr.taskId);
      return acc;
    }, {});

    for (const [taskGroupId, taskIds] of Object.entries(tasksByGroup)) {
      // FIXME: ugly type conversion, maybe use a map
      const userIds = await dbGetTaskGroupUsers(Number(taskGroupId));
      if (userIds.length === 0) {
        continue;
      }

      const nextResponsibleUserId = await getNextResponsibleUserId(
        Number(taskGroupId),
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
  const currentAssignments = await db
    .select()
    .from(assignmentTable)
    .innerJoin(taskTable, eq(taskTable.id, assignmentTable.taskId))
    .innerJoin(taskGroupTable, eq(taskGroupTable.id, taskTable.taskGroupId))
    .where(
      sql`${assignmentTable.createdAt} >= NOW() - ${taskGroupTable.interval} AND ${taskGroupTable.id} = ${taskGroupId}`,
    );

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

  let nextResponsibleUserId: number;
  if (userIdsWithoutAnyAssignments.length === 0) {
    nextResponsibleUserId =
      lastAssignments[lastAssignments.length - 1].assignment.userId;
  } else {
    nextResponsibleUserId = randomFromArray(userIdsWithoutAnyAssignments);
  }
  return nextResponsibleUserId;
}
