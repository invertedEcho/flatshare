import { eq } from 'drizzle-orm';
import { db } from '.';
import { SelectTask, taskTable } from './schema';

export async function dbGetAllTasks(): Promise<SelectTask[]> {
  return await db.select().from(taskTable);
}

export async function dbGetTaskById(taskId: number): Promise<SelectTask> {
  const queryResult = await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.id, taskId))
    .limit(1);
  return queryResult[0];
}
