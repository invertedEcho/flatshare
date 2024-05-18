import { db } from '..';
import { taskGroupTable } from '../schema';

export async function dbGetTaskGroups() {
  return await db.select().from(taskGroupTable);
}
