import { count, desc, eq, or, sql } from 'drizzle-orm';
import { db } from '..';
import { taskGroupAssignmentTable, taskGroupTable } from '../schema';

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

export async function dbCreateTaskGroupAssignment(
  taskGroupId: number,
  userId: number,
) {
  await db.insert(taskGroupAssignmentTable).values({ taskGroupId, userId });
}

export async function dbGetTaskGroupsToAssignForCurrentInterval() {
  try {
    const taskGroupIdsToCreateAssignmentsFor = await db
      .select({
        taskGroupId: taskGroupTable.id,
      })
      .from(taskGroupTable)
      .leftJoin(
        taskGroupAssignmentTable,
        eq(taskGroupTable.id, taskGroupAssignmentTable.taskGroupId),
      )
      .groupBy(taskGroupTable.id)
      .having(
        or(
          eq(count(taskGroupAssignmentTable.id), 0),
          sql`MAX(${taskGroupAssignmentTable.createdAt}) < (NOW() - ${taskGroupTable.interval})`,
        ),
      );

    return taskGroupIdsToCreateAssignmentsFor;
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
