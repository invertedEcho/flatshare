import { eq, and } from 'drizzle-orm';
import { db } from '..';
import {
  SelectTask,
  assignmentTable,
  taskUserGroupTable,
  taskTable,
  recurringTaskGroupTable,
} from '../schema';
import { OneOffTask, UpdateTask } from 'src/tasks/task.controller';
import {
  DefaultPostgresInterval,
  getLongNameFromPostgresInterval,
} from 'src/utils/interval';
import { dbCreateTaskGroup } from './task-group';
import { dbGetUsersOfUserGroup } from './user-group';
import { getStartOfInterval } from 'src/utils/date';

export async function dbGetAllTasks({
  userGroupId,
}: {
  userGroupId?: number;
}): Promise<SelectTask[]> {
  const query = db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      description: taskTable.description,
      createdAt: taskTable.createdAt,
      recurringTaskGroupId: taskTable.recurringTaskGroupId,
    })
    .from(taskTable);
  if (userGroupId === undefined) {
    return await query;
  }
  return await query
    .innerJoin(taskUserGroupTable, eq(taskUserGroupTable.taskId, taskTable.id))
    .where(eq(taskUserGroupTable.groupId, userGroupId));
}

export async function dbGetTaskById(taskId: number) {
  const queryResult = await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.id, taskId))
    .limit(1);
  return queryResult[0];
}

type CreateRecurringTask = {
  title: string;
  description?: string;
  interval: DefaultPostgresInterval;
  userGroupId: number;
};

export async function dbCreateRecurringTask({
  title,
  description,
  userGroupId,
  interval,
}: CreateRecurringTask) {
  const recurringTaskGroupTitle = getLongNameFromPostgresInterval(interval);

  const usersOfUserGroup = await dbGetUsersOfUserGroup({ userGroupId });

  const maybeExistingRecurringTaskGroup = (
    await db
      .select()
      .from(recurringTaskGroupTable)
      .where(
        and(
          eq(recurringTaskGroupTable.interval, interval),
          eq(recurringTaskGroupTable.userGroupId, userGroupId),
        ),
      )
      .limit(1)
  )[0];

  const recurringTaskGroupId =
    maybeExistingRecurringTaskGroup === undefined
      ? (
          await dbCreateTaskGroup({
            interval,
            title: recurringTaskGroupTitle,
            userIds: usersOfUserGroup.map(
              (userOfUserGroup) => userOfUserGroup.userId,
            ),
            initialStartDate: getStartOfInterval(interval),
            userGroupId,
          })
        ).id
      : maybeExistingRecurringTaskGroup.id;

  const task = (
    await db
      .insert(taskTable)
      .values({
        title,
        description,
        recurringTaskGroupId,
      })
      .returning()
  )[0];

  if (task === undefined) {
    throw new Error('Failed to create recurring task.');
  }

  await db
    .insert(taskUserGroupTable)
    .values({ taskId: task.id, groupId: userGroupId });
  return task;
}

export async function dbDeleteTask({ taskId }: { taskId: number }) {
  await db.delete(assignmentTable).where(eq(assignmentTable.taskId, taskId));
  await db
    .delete(taskUserGroupTable)
    .where(eq(taskUserGroupTable.taskId, taskId));
  await db.delete(taskTable).where(eq(taskTable.id, taskId));
}

export async function dbUpdateTask({
  description,
  taskGroupId,
  title,
  id,
}: UpdateTask & { id: number }) {
  await db
    .update(taskTable)
    .set({ title, description, recurringTaskGroupId: taskGroupId })
    .where(eq(taskTable.id, id));
}

export async function dbCreateOneOffTask({
  title,
  description,
  userIds,
  groupId,
}: OneOffTask & { groupId: number }) {
  const tasks = await db
    .insert(taskTable)
    .values({ title, description })
    .returning();
  const task = tasks[0];
  if (task === undefined) {
    throw new Error('Failed to create one off task.');
  }

  const hydratedAssignments = userIds.map((userId) => {
    return {
      taskId: task.id,
      userId,
    };
  });
  await db.insert(taskUserGroupTable).values({ taskId: task.id, groupId });

  await db.insert(assignmentTable).values(hydratedAssignments);
  return task;
}
