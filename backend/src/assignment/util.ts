import { dbGetAssignmentsForTaskGroup } from 'src/db/functions/assignment';
import { RecurringTaskGroupToAssign } from 'src/db/functions/recurring-task-group';
import { InsertAssignment } from 'src/db/schema';
import { getStartOfInterval } from 'src/utils/date';

/**
 * Hydrates recurringTaskGroupsToAssign to "ready-to-insert" assignments.
 *
 * This is done by finding the next responsible user id for each recurring task group.
 
 * Note that this function queries the database to retrieve the latest assignment for each `recurringTaskGroup`.
 *
 * @param recurringTaskGroupsToAssign The recurring task groups where assignments need to be created.
 */
export async function hydrateRecurringTaskGroupsToAssignToAssignments(
  recurringTaskGroupsToAssign: RecurringTaskGroupToAssign[],
): Promise<InsertAssignment[]> {
  const latestAssignmentUserIdForEachRecurringTaskGroup: {
    recTaskGroupId: number;
    userId: number | undefined;
  }[] = await Promise.all(
    recurringTaskGroupsToAssign.map(async (rec) => {
      const latestAssignment = (
        await dbGetAssignmentsForTaskGroup({
          taskGroupId: rec.recurringTaskGroupId,
          limit: 1,
        })
      )[0];
      return {
        recTaskGroupId: rec.recurringTaskGroupId,
        userId: latestAssignment?.userId,
      };
    }),
  );

  const assignmentsToCreate: InsertAssignment[] = [];
  for (const recurringTaskGroup of recurringTaskGroupsToAssign) {
    const { recurringTaskGroupId, userIdsOfRecurringTaskGroup } =
      recurringTaskGroup;

    const usersOfTaskGroup = userIdsOfRecurringTaskGroup.map(
      (userId, index) => {
        const assignmentOrdinal = recurringTaskGroup.assignmentOrdinals[index];
        if (assignmentOrdinal === undefined) {
          throw new Error('No assignment ordinal for userId');
        }
        return {
          userId,
          assignmentOrdinal,
        };
      },
    );

    const userIdOfLatestAssignment =
      latestAssignmentUserIdForEachRecurringTaskGroup.find(
        (item) => item.recTaskGroupId === recurringTaskGroupId,
      )?.userId;

    const nextResponsibleUserId =
      findNextResponsibleUserIdForRecurringTaskGroup(
        userIdOfLatestAssignment,
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

    assignmentsToCreate.push(...hydratedAssignments);
  }
  return assignmentsToCreate;
}

/**
 * Finds the next responsible user id for a recurring task group.
 *
 * @param userIdOfLatestAssignment The userId of the latest assignment from a recurring task group.
 * @param usersOfRecurringTaskGroup All users (with their `assignmentOrdinal`) belonging to the recurring task group.
 */
export function findNextResponsibleUserIdForRecurringTaskGroup(
  userIdOfLatestAssignment: number | undefined,
  usersOfRecurringTaskGroup: { userId: number; assignmentOrdinal: number }[],
) {
  const usersSortedByAssignmentOrdinal = usersOfRecurringTaskGroup.sort(
    (a, b) => a.assignmentOrdinal - b.assignmentOrdinal,
  );

  if (userIdOfLatestAssignment === null) {
    return usersSortedByAssignmentOrdinal[0]?.userId;
  }

  const lastAssignmentUserIndex = usersSortedByAssignmentOrdinal.findIndex(
    (user) => user.userId === userIdOfLatestAssignment,
  );

  if (lastAssignmentUserIndex === usersSortedByAssignmentOrdinal.length - 1) {
    return usersSortedByAssignmentOrdinal[0]?.userId;
  }

  return usersSortedByAssignmentOrdinal[lastAssignmentUserIndex + 1]?.userId;
}
