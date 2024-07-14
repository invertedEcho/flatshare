import { count, eq } from 'drizzle-orm';
import { db } from '..';
import {
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  userTable,
} from '../schema';
import { CreateTaskGroup } from 'src/tasks/task-group.controller';

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
}: CreateTaskGroup) {
  try {
    const res = await db
      .insert(recurringTaskGroupTable)
      .values({
        title,
        description,
        interval,
        initialStartDate: new Date(initialStartDate),
        userGroupId,
      })
      .returning({ recurringTaskGroupId: recurringTaskGroupTable.id });

    const { recurringTaskGroupId } = res[0];

    await db.insert(recurringTaskGroupUserTable).values(
      userIds.map((userId) => ({
        recurringTaskGroupId,
        userId,
      })),
    );
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbGetTaskGroupUsers(taskGroupId: number) {
  try {
    const taskGroupUsers = await db
      .select({ userId: userTable.id })
      .from(recurringTaskGroupUserTable)
      .innerJoin(
        userTable,
        eq(recurringTaskGroupUserTable.userId, userTable.id),
      )
      .where(eq(recurringTaskGroupUserTable.recurringTaskGroupId, taskGroupId));

    return taskGroupUsers;
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbGetTasksOfTaskGroup(taskGroupId: number) {
  return await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.recurringTaskGroupId, taskGroupId));
}
