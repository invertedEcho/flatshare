import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  dbAddAssignments,
  dbGetAssignmentsForTaskGroup,
  dbGetCurrentAssignmentsForTaskGroup,
  dbGetTasksToAssignForCurrentInterval,
  TaskToAssign,
} from 'src/db/functions/assignment';
import { dbGetTaskGroupUsers } from 'src/db/functions/task-group';
import { getStartOfInterval } from 'src/utils/date';

// TODO: Clean up
@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test'
    )
      return;
    const tasksToCreateAssignmentsFor =
      await dbGetTasksToAssignForCurrentInterval({});

    // TODO: create a arrayGroupBy util function
    const tasksByGroup = tasksToCreateAssignmentsFor.reduce<
      Map<number, TaskToAssign[]>
    >((acc, curr) => {
      if (!acc.get(curr.taskGroupId)) {
        acc.set(curr.taskGroupId, []);
      }
      acc.get(curr.taskGroupId)?.push({
        ...curr,
        taskGroupInitialStartDate: curr.taskGroupInitialStartDate,
      });
      return acc;
    }, new Map());

    // TODO: yeaaahhhhh, we probably want to just have a db query with a join instead of iterating over a result set and querying
    // the db for each item.
    for (const [taskGroupId, tasks] of tasksByGroup) {
      const userIds = await dbGetTaskGroupUsers(taskGroupId);
      if (userIds.length === 0) {
        continue;
      }

      const nextResponsibleUserId = await getNextResponsibleUserId(
        taskGroupId,
        userIds.map(({ userId }) => userId),
      );

      if (nextResponsibleUserId === undefined) {
        throw new Error(
          `Failed to find the next responsible user for the task group ${taskGroupId}`,
        );
      }

      const hydratedAssignments = tasks.map((task) => ({
        taskId: task.taskId,
        userId: nextResponsibleUserId,
        createdAt: task.isInFirstInterval
          ? task.taskGroupInitialStartDate
          : getStartOfInterval(task.interval),
      }));
      console.info(
        `Creating new assignments for taskGroup ${taskGroupId}: ${JSON.stringify(tasks, null, 2)}`,
      );
      await dbAddAssignments({ assignments: hydratedAssignments });
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
    return currentAssignments[0]?.assignment.userId;
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
    return lastAssignments[lastAssignments.length - 1]?.assignment.userId;
  } else {
    return userIdsWithoutAnyAssignments[0];
  }
}
