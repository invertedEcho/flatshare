import { eq } from 'drizzle-orm';
import { db } from '..';
import {
  taskGroupTable,
  taskGroupUserTable,
  taskTable,
  userTable,
} from '../schema';
import { CreateTaskGroup } from 'src/tasks/task-group.controller';

export async function dbGetTaskGroups() {
  return await db.select().from(taskGroupTable);
}

export async function dbCreateTaskGroup({
  title,
  description,
  interval,
  userIds,
  initialStartDate,
}: CreateTaskGroup) {
  try {
    const res = await db
      .insert(taskGroupTable)
      .values({
        title,
        description,
        interval,
        initialStartDate: new Date(initialStartDate),
      })
      .returning({ taskGroupId: taskGroupTable.id });

    const { taskGroupId } = res[0];

    await db.insert(taskGroupUserTable).values(
      userIds.map((userId) => ({
        taskGroupId,
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
      .from(taskGroupUserTable)
      .innerJoin(userTable, eq(taskGroupUserTable.userId, userTable.id))
      .where(eq(taskGroupUserTable.taskGroupId, taskGroupId));

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
    .where(eq(taskTable.taskGroupId, taskGroupId));
}
