import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    return;
    //     const tasksToCreateAssignmentsFor =
    //       await dbGetTasksToAssignForCurrentInterval();
    //     if (tasksToCreateAssignmentsFor.length >= 1) {
    //       console.info(
    //         `Creating new assignments for ${tasksToCreateAssignmentsFor}`,
    //       );
    //     }
    //
    //     const tasksByGroup = tasksToCreateAssignmentsFor.reduce<
    //       Map<
    //         number,
    //         {
    //           taskId: number;
    //           taskGroupId: number;
    //           taskGroupInitialStartDate: Date;
    //           isInFirstInterval: boolean;
    //         }[]
    //       >
    //     >((acc, curr) => {
    //       if (!acc.get(curr.taskGroupId)) {
    //         acc.set(curr.taskGroupId, []);
    //       }
    //       acc.get(curr.taskGroupId)?.push(curr);
    //       return acc;
    //     }, new Map());
    //
    //     for (const [taskGroupId, tasks] of tasksByGroup) {
    //       const userIds = await dbGetTaskGroupUsers(taskGroupId);
    //       if (userIds.length === 0) {
    //         continue;
    //       }
    //
    //       const nextResponsibleUserId = await getNextResponsibleUserId(
    //         taskGroupId,
    //         userIds.map(({ userId }) => userId),
    //       );
    //
    //       await db.insert(assignmentTable).values(
    //         tasks.map(
    //           ({ taskId, isInFirstInterval, taskGroupInitialStartDate }) => ({
    //             taskId,
    //             userId: nextResponsibleUserId,
    //             createdAt: isInFirstInterval
    //               ? taskGroupInitialStartDate
    //               : new Date(new Date().setHours(0, 0, 0, 0)),
    //           }),
    //         ),
    //       );
    //     }
    //   }
    // }
    //
    // async function getNextResponsibleUserId(
    //   taskGroupId: number,
    //   userIds: number[],
    // ) {
    //   const currentAssignments =
    //     await dbGetCurrentAssignmentsForTaskGroup(taskGroupId);
    //
    //   /* If there already are current assignments, return the userId of one of the current assignments
    //    (It doesn't matter which one, they should all be assigned to the same user) */
    //   if (currentAssignments.length != 0) {
    //     return currentAssignments[0].assignment.userId;
    //   }
    //
    //   const lastAssignments = await dbGetAssignmentsForTaskGroup(
    //     taskGroupId,
    //     userIds.length,
    //   );
    //   const userIdsWithoutAnyAssignments = userIds.filter(
    //     (userId) =>
    //       !lastAssignments.some(({ assignment }) => assignment.userId === userId),
    //   );
    //
    //   /* If all users were already assigned the task, the next responsible user is the one who was assigned the task the longest ago.
    //     Otherwise it is randomly chosen from the users that were not assigned the task yet */
    //   if (userIdsWithoutAnyAssignments.length === 0) {
    //     return lastAssignments[lastAssignments.length - 1].assignment.userId;
    //   } else {
    //     return randomFromArray(userIdsWithoutAnyAssignments);
    //   }
  }
}