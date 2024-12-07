import { dbGetAssignmentsForTaskGroup } from 'src/db/functions/assignment';
import { TaskGroupToAssign } from 'src/db/functions/task-group';
import { InsertAssignment } from 'src/db/schema';
import { getStartOfInterval } from 'src/utils/date';

/**
 * Hydrates taskGroupsToAssign to "ready-to-insert" assignments.
 *
 * This is done by finding the next responsible user id for each task group.
 
 * Note that this function queries the database to retrieve the latest assignment for each `taskGroup`.
 *
 * @param taskGroupsToAssign The task groups where assignments need to be created.
 */
export async function hydrateTaskGroupsToAssignToAssignments(
  taskGroupsToAssign: TaskGroupToAssign[],
): Promise<InsertAssignment[]> {
  const latestAssignmentUserIdForEachTaskGroup: {
    taskGroupId: number;
    userId: number | undefined;
  }[] = await Promise.all(
    taskGroupsToAssign.map(async (taskGroupToAssign) => {
      const latestAssignment = (
        await dbGetAssignmentsForTaskGroup({
          taskGroupId: taskGroupToAssign.taskGroupId,
          limit: 1,
        })
      )[0];
      return {
        taskGroupId: taskGroupToAssign.taskGroupId,
        userId: latestAssignment?.userId,
      };
    }),
  );

  const assignmentsToCreate: InsertAssignment[] = [];
  for (const taskGroupToAssign of taskGroupsToAssign) {
    const { taskGroupId, userIdsOfTaskGroup } = taskGroupToAssign;

    const usersOfTaskGroup = userIdsOfTaskGroup.map((userId, index) => {
      const assignmentOrdinal = taskGroupToAssign.assignmentOrdinals[index];
      if (assignmentOrdinal === undefined) {
        throw new Error('No assignment ordinal for userId');
      }
      return {
        userId,
        assignmentOrdinal,
      };
    });

    const userIdOfLatestAssignment =
      latestAssignmentUserIdForEachTaskGroup.find(
        (item) => item.taskGroupId === taskGroupId,
      )?.userId;

    const nextResponsibleUserId = findNextResponsibleUserIdForTaskGroup(
      userIdOfLatestAssignment,
      usersOfTaskGroup,
    );

    if (nextResponsibleUserId === undefined) {
      throw new Error(
        `Failed to find the next responsible user for the task group ${taskGroupId}`,
      );
    }

    const taskIds = taskGroupToAssign.taskIds;
    const hydratedAssignments = taskIds.map((taskId) => ({
      taskId,
      userId: nextResponsibleUserId,
      createdAt: taskGroupToAssign.isInFirstInterval
        ? taskGroupToAssign.taskGroupInitialStartDate
        : getStartOfInterval(taskGroupToAssign.interval),
    }));

    assignmentsToCreate.push(...hydratedAssignments);
  }
  return assignmentsToCreate;
}

/**
 * Finds the next responsible user id for a task group.
 *
 * @param userIdOfLatestAssignment The userId of the latest assignment from a task group.
 * @param usersOfTaskGroup All users (with their `assignmentOrdinal`) belonging to the task group.
 */
export function findNextResponsibleUserIdForTaskGroup(
  userIdOfLatestAssignment: number | undefined,
  usersOfTaskGroup: { userId: number; assignmentOrdinal: number }[],
) {
  const usersSortedByAssignmentOrdinal = usersOfTaskGroup.sort(
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
