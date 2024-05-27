import { count, desc, eq, or, sql } from 'drizzle-orm';
import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  assignmentTable,
  taskGroupTable,
  taskTable,
  userTable,
} from '../schema';

export async function dbGetAllAssignments(): Promise<AssignmentResponse[]> {
  try {
    const queryResult = await db
      .select({
        id: assignmentTable.id,
        title: taskTable.title,
        description: taskTable.description,
        assigneeId: userTable.id,
        assigneeName: userTable.username,
        isCompleted: sql<boolean>`${assignmentTable.state} = 'completed'`,
        createdAt: assignmentTable.createdAt,
        isOneOff: sql<boolean>`${taskTable.taskGroupId} IS NULL`,
        dueDate: sql<string>`${assignmentTable.createdAt} + (${taskGroupTable.interval} - interval '1 day')`,
      })
      .from(assignmentTable)
      .innerJoin(userTable, eq(assignmentTable.userId, userTable.id))
      .innerJoin(taskTable, eq(assignmentTable.taskId, taskTable.id))
      .innerJoin(taskGroupTable, eq(taskTable.taskGroupId, taskGroupTable.id));

    return queryResult.map((assignment) => {
      // This is dirty. Drizzle returns dueDate as a string with not timezone information so I need to add the z to make the date constructor interpret it as utc.
      const date = new Date(new Date(assignment.dueDate + 'Z'));
      return {
        ...assignment,
        dueDate: date,
      };
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

export async function dbGetCurrentAssignmentsForTaskGroup(taskGroupId: number) {
  const currentAssignments = await db
    .select()
    .from(assignmentTable)
    .innerJoin(taskTable, eq(taskTable.id, assignmentTable.taskId))
    .innerJoin(taskGroupTable, eq(taskGroupTable.id, taskTable.taskGroupId))
    .where(
      sql`${assignmentTable.createdAt} >= NOW() - ${taskGroupTable.interval} AND ${taskGroupTable.id} = ${taskGroupId}`,
    );

  return currentAssignments;
}

export async function dbGetTasksToAssignForCurrentInterval() {
  try {
    // Get all tasks that either have no assignments yet or don't have an assignment in the current period
    const taskIdsToCreateAssignmentsFor = await db
      .select({
        taskId: taskTable.id,
        taskGroupId: taskGroupTable.id,
        taskGroupInitialStartDate: taskGroupTable.initialStartDate,
        isInFirstInterval: sql<boolean>`NOW() < (${taskGroupTable.initialStartDate} + ${taskGroupTable.interval})`,
      })
      .from(taskGroupTable)
      .innerJoin(taskTable, eq(taskGroupTable.id, taskTable.taskGroupId))
      .leftJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
      .where(sql`${taskGroupTable.initialStartDate} <= NOW()`)
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
