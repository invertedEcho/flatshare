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
      console.info(
        `Creating new assignments for taskGroup ${taskGroupId}: ${JSON.stringify(tasks, null, 2)}`,
        `Creating new assignments for taskGroup ${taskGroupId}: ${tasks.length}`,
      );
      await dbAddAssignments({ assignments: hydratedAssignments });
    }
  }
}

// TODO: write unit test
async function getNextResponsibleUserId(
  taskGroupId: number,
  usersOfTaskGroup: { userId: number; assignmentOrdinal: number }[],
) {
  const lastAssignmentsOfTaskGroup = await dbGetAssignmentsForTaskGroup(
    taskGroupId,
    1,
  );

  const lastAssignmentOfTaskGroup = lastAssignmentsOfTaskGroup[0];

  if (lastAssignmentOfTaskGroup === undefined) {
    return usersOfTaskGroup.find((user) => user.assignmentOrdinal === 0)
      ?.userId;
  }

  const lastUser = usersOfTaskGroup.find(
    (user) => user.userId === lastAssignmentOfTaskGroup.assignment.userId,
  );

  if (lastUser === undefined) {
    throw new Error(
      `User in last assignment was not found in provided 'usersOfTaskGroup' array`,
    );
  }

  const nextUser = usersOfTaskGroup.find(
    (user) =>
      user.assignmentOrdinal ===
      (lastUser.assignmentOrdinal + 1) % usersOfTaskGroup.length,
  );

  return nextUser?.userId;
}
