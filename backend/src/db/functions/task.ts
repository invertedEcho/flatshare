import { eq } from 'drizzle-orm';
import { db } from '..';
import {
  InsertTask,
  SelectTask,
  assignmentTable,
  taskUserGroupTable,
  taskTable,
} from '../schema';
import { OneOffTask, UpdateTask } from 'src/tasks/task.controller';

export async function dbGetAllTasks({
  groupId,
}: {
  groupId?: number;
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
  if (groupId === undefined) {
    return await query;
  }
  return await query
    .innerJoin(taskUserGroupTable, eq(taskUserGroupTable.taskId, taskTable.id))
    .where(eq(taskUserGroupTable.groupId, groupId));
}

export async function dbGetTaskById(taskId: number) {
  try {
    const queryResult = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, taskId))
      .limit(1);
    return queryResult[0];
  } catch (error) {
    console.error({ error });
  }
}

export async function dbCreateRecurringTask({
  title,
  description,
  recurringTaskGroupId,
  groupId,
}: InsertTask & { groupId: number }) {
  try {
    const tasks = await db
      .insert(taskTable)
      .values({
        title,
        description,
        recurringTaskGroupId,
      })
      .returning();
    await db
      .insert(taskUserGroupTable)
      .values({ taskId: tasks[0].id, groupId });
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbDeleteRecurringTask({ taskId }: { taskId: number }) {
  try {
    console.debug('deleting task ', taskId);
    await db.delete(assignmentTable).where(eq(assignmentTable.taskId, taskId));
    await db
      .delete(taskUserGroupTable)
      .where(eq(taskUserGroupTable.taskId, taskId));
    await db.delete(taskTable).where(eq(taskTable.id, taskId));
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbUpdateTask({
  description,
  taskGroupId,
  title,
  id,
}: UpdateTask & { id: number }) {
  try {
    await db
      .update(taskTable)
      .set({ title, description, recurringTaskGroupId: taskGroupId })
      .where(eq(taskTable.id, id));
  } catch (error) {
    console.error({ error });
    throw error;
  }
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
    .returning({ taskId: taskTable.id });
  const task = tasks[0];

  const hydratedAssignments = userIds.map((userId) => {
    return {
      taskId: task.taskId,
      userId,
    };
  });
  await db.insert(taskUserGroupTable).values({ taskId: task.taskId, groupId });

  await db.insert(assignmentTable).values(hydratedAssignments);
}
