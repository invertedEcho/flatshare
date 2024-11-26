import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  dbAddAssignments,
  dbGetAssignmentsForRecurringTaskGroup,
  dbGetRecurringTaskGroupsToAssignForCurrentInterval,
} from 'src/db/functions/assignment';
import { getStartOfInterval } from 'src/utils/date';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const recurringTaskGroupsToAssign =
      await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
        currentTime: undefined,
      });

    for (const recurringTaskGroup of recurringTaskGroupsToAssign) {
      const recurringTaskGroupId = recurringTaskGroup.recurringTaskGroupId;

      const usersOfTaskGroup =
        recurringTaskGroup.userIdsOfRecurringTaskGroup.map((userId, index) => {
          const assignmentOrdinal =
            recurringTaskGroup.assignmentOrdinals[index];
          if (assignmentOrdinal === undefined) {
            throw new Error('No assignment ordinal for userId');
          }
          return {
            userId,
            assignmentOrdinal,
          };
        });

      // TODO: we should also do this in the main query
      const nextResponsibleUserId = await getNextResponsibleUserId(
        recurringTaskGroupId,
        usersOfTaskGroup,
      );

      if (nextResponsibleUserId === undefined) {
        throw new Error(
          `Failed to find the next responsible user for the task group ${recurringTaskGroupId}`,
        );
      }

      const taskIds = recurringTaskGroup.taskIds;
      const hydratedAssignments = taskIds.map((taskId) => ({
        taskId: taskId,
        userId: nextResponsibleUserId,
        createdAt: recurringTaskGroup.isInFirstInterval
          ? recurringTaskGroup.taskGroupInitialStartDate
          : getStartOfInterval(recurringTaskGroup.interval),
      }));

      await dbAddAssignments({ assignments: hydratedAssignments });
      console.info(
        `Created new assignments for recurringTaskGroup ${recurringTaskGroupId}: ${JSON.stringify(hydratedAssignments, null, 2)}`,
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

  const lastAssignmentsOfTaskGroup =
    await dbGetAssignmentsForRecurringTaskGroup({
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
