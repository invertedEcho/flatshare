import { eq } from 'drizzle-orm';
import { db } from '.';
import {
  SelectTask,
  taskGroupTable,
  taskTable,
  userTaskGroupTable,
} from './schema';
import { CreateTask, CreateTaskGroup, UpdateTask } from 'src/task.controller';

export async function dbGetAllTasks(): Promise<SelectTask[]> {
  return await db.select().from(taskTable);
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

export async function dbCreateTask({
  title,
  description,
  taskGroupId,
}: CreateTask) {
  try {
    await db.insert(taskTable).values({
      title,
      description,
      taskGroupId,
    });
  } catch (error) {
    console.error({ error });
    throw error;
  }
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

    await db.insert(userTaskGroupTable).values(
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

export async function dbUpdateTask({
  description,
  taskGroupId,
  title,
  id,
}: UpdateTask & { id: number }) {
  try {
    await db
      .update(taskTable)
      .set({ title, description, taskGroupId })
      .where(eq(taskTable.id, id));
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
