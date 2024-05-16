import { eq } from 'drizzle-orm';
import { db } from '.';
import { SelectTask, taskTable } from './schema';
import { CreateTask, UpdateTask } from 'src/task.controller';

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
