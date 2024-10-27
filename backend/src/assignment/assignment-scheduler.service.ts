import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  dbAddAssignments,
  dbGetAssignmentsForTaskGroup,
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
      const usersOfTaskGroup = await dbGetTaskGroupUsers(taskGroupId);
      if (usersOfTaskGroup.length === 0) {
        continue;
      }

      const nextResponsibleUserId = await getNextResponsibleUserId(
        taskGroupId,
        usersOfTaskGroup,
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

      await dbAddAssignments({ assignments: hydratedAssignments });
      console.info(
        `Created new assignments for taskGroup ${taskGroupId}: ${JSON.stringify(hydratedAssignments, null, 2)}`,
      );
    }
  }
}

async function getNextResponsibleUserId(
  taskGroupId: number,
  usersOfTaskGroup: { userId: number; assignmentOrdinal: number }[],
) {
  const usersSortedByAssignmentOrdinal = usersOfTaskGroup.sort(
    (a, b) => a.assignmentOrdinal - b.assignmentOrdinal,
  );

  const lastAssignmentsOfTaskGroup = await dbGetAssignmentsForTaskGroup({
    taskGroupId,
    limit: 1,
  });

  const lastAssignmentOfTaskGroup = lastAssignmentsOfTaskGroup[0];

  if (lastAssignmentOfTaskGroup === undefined) {
    return usersSortedByAssignmentOrdinal[0]?.userId;
  }

  const lastAssignmentUserIndex = usersSortedByAssignmentOrdinal.findIndex(
    (user) => user.userId === lastAssignmentOfTaskGroup.userId,
  );

  if (lastAssignmentUserIndex === usersSortedByAssignmentOrdinal.length - 1) {
    return usersSortedByAssignmentOrdinal[0]?.userId;
  }

  return usersSortedByAssignmentOrdinal[lastAssignmentUserIndex + 1]?.userId;
}
