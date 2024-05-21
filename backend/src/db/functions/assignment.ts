import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  assignmentTable,
  taskGroupTable,
  taskTable,
  userTable,
} from '../schema';
import { count, desc, eq, or, sql } from 'drizzle-orm';

export async function dbGetAllAssignments(): Promise<AssignmentResponse[]> {
  try {
    const queryResult = await db
      .select()
      .from(assignmentTable)
      .innerJoin(userTable, eq(assignmentTable.userId, userTable.id))
      .innerJoin(taskTable, eq(assignmentTable.taskId, taskTable.id));

    return queryResult.map((query) => {
      return {
        title: query.task.title,
        description: query.task.description,
        id: query.assignment.id,
        assigneeId: query.user.id,
        assigneeName: query.user.email,
        isCompleted: query.assignment.state === 'completed',
        createdAt: query.assignment.createdAt,
      } satisfies AssignmentResponse;
    });
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbChangeAssignmentState(
  assignmentId: number,
  state: AssignmentState,
) {
  try {
    await db
      .update(assignmentTable)
      .set({ state })
      .where(eq(assignmentTable.id, assignmentId));
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbGetAssignmentsForTaskGroup(
  taskGroupId: number,
  limit?: number,
) {
  const result = db
    .select({ assignment: { ...assignmentTable } })
    .from(taskGroupTable)
    .innerJoin(taskTable, eq(taskGroupTable.id, taskTable.taskGroupId))
    .innerJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
    .where(eq(taskGroupTable.id, taskGroupId))
    .orderBy(desc(assignmentTable.createdAt));
  if (limit === undefined) {
    return await result;
  }
  return await result.limit(limit);
}

export async function dbGetTasksToAssignForCurrentInterval() {
  try {
    // Get all tasks that either have no assignments yet or don't have an assignment in the current period
    const taskIdsToCreateAssignmentsFor = await db
      .select({
        taskId: taskTable.id,
        taskGroupId: taskGroupTable.id,
      })
      .from(taskGroupTable)
      .innerJoin(taskTable, eq(taskGroupTable.id, taskTable.taskGroupId))
      .leftJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
      .groupBy(taskGroupTable.id, taskTable.id)
      .having(
        or(
          eq(count(assignmentTable.id), 0),
          sql`MAX(${assignmentTable.createdAt}) <= (NOW() - ${taskGroupTable.interval})`,
        ),
      );

    return taskIdsToCreateAssignmentsFor;
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
