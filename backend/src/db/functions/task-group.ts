import { eq, sql } from 'drizzle-orm';
import { CreateTaskGroup } from 'src/task-group.controller';
import { db } from '..';
import {
  taskGroupAssignmentTable,
  taskGroupTable,
  taskGroupUserTable,
  userTable,
} from '../schema';

export async function dbGetTaskGroups() {
  return await db.select().from(taskGroupTable);
}

export async function dbCreateTaskGroup({
  title,
  description,
  intervalDays,
  userIds,
  initialStartDate,
}: CreateTaskGroup) {
  try {
    const res = await db
      .insert(taskGroupTable)
      .values({
        title,
        description,
        interval: `${intervalDays} days`,
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

export async function dbGetTaskGroupsToCreateForCurrentInterval() {
  try {
    const taskGroupIdsToCreateAssignmentsFor = await db
      .select({
        taskGroupId: taskGroupTable.id,
      })
      .from(taskGroupTable)
      .innerJoin(
        taskGroupAssignmentTable,
        eq(taskGroupTable.id, taskGroupAssignmentTable.taskGroupId),
      )
      .groupBy(taskGroupTable.id);
    // .having(
    //   sql`MAX(${taskGroupAssignmentTable.createdAt}) < (NOW() - ${taskGroupTable.interval})`,
    // );
    return taskGroupIdsToCreateAssignmentsFor;
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
      .where(eq(taskGroupTable.id, taskGroupId));

    return taskGroupUsers;
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
