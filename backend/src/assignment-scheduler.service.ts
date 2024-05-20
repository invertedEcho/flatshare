import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  dbGetTaskGroupUsers,
  dbGetTasksOfTaskGroup,
} from './db/functions/task-group';
import {
  dbCreateTaskGroupAssignment,
  dbGetAssignmentsForTaskGroup,
  dbGetTaskGroupsToAssignForCurrentInterval,
} from './db/functions/assignment-task-group';
import { randomFromArray } from './utils/array';
import { db } from './db';
import { assignmentTable } from './db/schema';

@Injectable()
export class AssignmentSchedulerService {
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    console.debug('CRON job running');
    const taskGroupsToCreateAssignmentsFor =
      await dbGetTaskGroupsToAssignForCurrentInterval();
    console.debug({ taskGroupsToCreateAssignmentsFor });
    for (const { taskGroupId } of taskGroupsToCreateAssignmentsFor) {
      const userIds = await dbGetTaskGroupUsers(taskGroupId);
      if (userIds.length === 0) {
        continue;
      }
      const lastAssignments = await dbGetAssignmentsForTaskGroup(
        taskGroupId,
        userIds.length,
      );
      const firstTimeAssignmentUsers = userIds.filter(
        ({ userId }) =>
          !lastAssignments.some((assignment) => assignment.userId === userId),
      );

      console.debug({ userIds });
      console.debug({ firstTimeAssignmentUsers });
      console.debug({ lastAssignments, taskGroupId });

      let nextResponsibleUserId: number;
      if (firstTimeAssignmentUsers.length === 0) {
        nextResponsibleUserId =
          lastAssignments[lastAssignments.length - 1].userId;
      } else {
        nextResponsibleUserId = randomFromArray(
          firstTimeAssignmentUsers,
        ).userId;
      }

      await dbCreateTaskGroupAssignment(taskGroupId, nextResponsibleUserId);
      const tasksOfTaskGroup = await dbGetTasksOfTaskGroup(taskGroupId);
      const assignmentsToCreate = tasksOfTaskGroup.map((task) => {
        return {
          taskId: task.id,
          userId: nextResponsibleUserId,
        };
      });
      await db.insert(assignmentTable).values(assignmentsToCreate);
    }
  }
}
