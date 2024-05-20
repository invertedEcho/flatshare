import { desc, eq } from 'drizzle-orm';
import { db } from '..';
import { taskGroupAssignmentTable } from '../schema';

export async function dbGetAssignmentsForTaskGroup(
  taskGroupId: number,
  limit?: number,
) {
  const result = db
    .select()
    .from(taskGroupAssignmentTable)
    .where(eq(taskGroupAssignmentTable.taskGroupId, taskGroupId))
    .orderBy(desc(taskGroupAssignmentTable.createdAt));
  if (limit === undefined) {
    return await result;
  }
  return await result.limit(limit);
}
