import { count, eq, inArray } from 'drizzle-orm';
import { db } from '..';
import {
  InsertRecurringTaskGroup,
  assignmentTable,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
  userTable,
} from '../schema';

export async function dbGetTaskGroups({
  userGroupId,
}: {
  userGroupId: number;
}) {
  return await db
    .select({
      id: recurringTaskGroupTable.id,
      title: recurringTaskGroupTable.title,
      description: recurringTaskGroupTable.description,
      interval: recurringTaskGroupTable.interval,
      numberOfTasks: count(taskTable.id),
    })
    .from(recurringTaskGroupTable)
    .where(eq(recurringTaskGroupTable.userGroupId, userGroupId))
    .leftJoin(
      taskTable,
      eq(taskTable.recurringTaskGroupId, recurringTaskGroupTable.id),
    )
    .groupBy(taskTable.recurringTaskGroupId, recurringTaskGroupTable.id);
}

export async function dbCreateTaskGroup({
  title,
  description,
  interval,
  userIds,
  initialStartDate,
  userGroupId,
}: InsertRecurringTaskGroup & { userIds: number[] }) {
  const recurringTaskGroups = await db
    .insert(recurringTaskGroupTable)
    .values({
      title,
      description,
      interval,
      userGroupId,
      initialStartDate,
    })
    .returning({ recurringTaskGroupId: recurringTaskGroupTable.id });

  const recurringTaskGroup = recurringTaskGroups[0];

  if (recurringTaskGroup === undefined) {
    throw new Error('Failed to create recurring task group');
  }
  await db.insert(recurringTaskGroupUserTable).values(
    userIds.map((userId) => ({
      recurringTaskGroupId: recurringTaskGroup.recurringTaskGroupId,
      userId,
    })),
  );
}

export async function dbGetTaskGroupUsers(taskGroupId: number) {
  const taskGroupUsers = await db
    .select({ userId: userTable.id })
    .from(recurringTaskGroupUserTable)
    .innerJoin(userTable, eq(recurringTaskGroupUserTable.userId, userTable.id))
    .where(eq(recurringTaskGroupUserTable.recurringTaskGroupId, taskGroupId));

  return taskGroupUsers;
}

export async function dbGetTasksOfTaskGroup(taskGroupId: number) {
  return await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.recurringTaskGroupId, taskGroupId));
}

export async function dbDeleteTaskGroup(taskGroupId: number) {
  await db
    .delete(recurringTaskGroupUserTable)
    .where(eq(recurringTaskGroupUserTable.recurringTaskGroupId, taskGroupId));
  const taskIds = (await dbGetTasksOfTaskGroup(taskGroupId)).map(
    (task) => task.id,
  );
  if (taskIds.length > 0) {
    await db
      .delete(assignmentTable)
      .where(inArray(assignmentTable.taskId, taskIds));
    await db
      .delete(taskUserGroupTable)
      .where(inArray(taskUserGroupTable.taskId, taskIds));
    await db.delete(taskTable).where(inArray(taskTable.id, taskIds));
  }
  await db
    .delete(recurringTaskGroupTable)
    .where(eq(recurringTaskGroupTable.id, taskGroupId));
}
