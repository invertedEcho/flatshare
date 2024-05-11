import { eq } from 'drizzle-orm';
import { db } from '.';
import { SelectTask, taskTable } from './schema';
import { CreateTask } from 'src/task.controller';

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

export async function dbCreateTask(task: CreateTask) {
  try {
    await db.insert(taskTable).values({
      title: task.title,
      // default to null if empty string -> should handle this in another place
      description: task.description || null,
      // i dont like this
      interval: `${task.intervalValue} ${task.intervalType}`,
    });
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
