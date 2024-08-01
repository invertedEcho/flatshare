import { count, desc, eq, isNull, or, sql, and } from 'drizzle-orm';
import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  CreateAssignment,
  assignmentTable,
  recurringTaskGroupTable,
  taskTable,
  userUserGroupTable,
  userTable,
} from '../schema';

export async function dbGetAssignmentsFromCurrentInterval(
  groupId: number,
): Promise<AssignmentResponse[]> {
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
        isOneOff: sql<boolean>`${taskTable.recurringTaskGroupId} IS NULL`,
        // TODO: make timezone dynamic
        dueDate: sql<string>`(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${recurringTaskGroupTable.interval}) AT TIME ZONE 'Europe/Berlin' AT TIME ZONE 'UTC' - interval '1 day'`,
        taskGroupId: recurringTaskGroupTable.id,
        taskGroupTitle: recurringTaskGroupTable.title,
      })
      .from(assignmentTable)
      .innerJoin(userTable, eq(assignmentTable.userId, userTable.id))
      .innerJoin(taskTable, eq(assignmentTable.taskId, taskTable.id))
      .innerJoin(
        userUserGroupTable,
        and(
          eq(userUserGroupTable.groupId, groupId),
          eq(userUserGroupTable.userId, userTable.id),
        ),
      )
      .leftJoin(
        recurringTaskGroupTable,
        eq(taskTable.recurringTaskGroupId, recurringTaskGroupTable.id),
      )
      // Only get assignments from the current interval
      .where(
        // TODO: make timezone dynamic
        and(
          or(
            sql`now() < (${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${recurringTaskGroupTable.interval}) AT TIME ZONE 'Europe/Berlin' AT TIME ZONE 'UTC'`,
            isNull(recurringTaskGroupTable.id),
          ),
        ),
      );

    return queryResult.map((assignment) => {
      // This is dirty. Drizzle returns dueDate as a string with no timezone information, so I need to add the 'Z' to make the date constructor interpret it as UTC.
      const date = new Date(assignment.dueDate + 'Z');
      return {
        ...assignment,
        dueDate: assignment.isOneOff ? null : date,
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
    .from(recurringTaskGroupTable)
    .innerJoin(
      taskTable,
      eq(recurringTaskGroupTable.id, taskTable.recurringTaskGroupId),
    )
    .innerJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
    .where(eq(recurringTaskGroupTable.id, taskGroupId))
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
    .innerJoin(
      recurringTaskGroupTable,
      eq(recurringTaskGroupTable.id, taskTable.recurringTaskGroupId),
    )
    .where(
      sql`${assignmentTable.createdAt} >= NOW() - ${recurringTaskGroupTable.interval} AND ${recurringTaskGroupTable.id} = ${taskGroupId}`,
    );

  return currentAssignments;
}

export async function dbGetTasksToAssignForCurrentInterval() {
  try {
    // Get all tasks that either have no assignments yet or don't have an assignment in the current period
    const taskIdsToCreateAssignmentsFor = await db
      .select({
        taskId: taskTable.id,
        taskGroupId: recurringTaskGroupTable.id,
        taskGroupInitialStartDate: recurringTaskGroupTable.initialStartDate,
        isInFirstInterval: sql<boolean>`NOW() < (${recurringTaskGroupTable.initialStartDate} + ${recurringTaskGroupTable.interval})`,
      })
      .from(recurringTaskGroupTable)
      .innerJoin(
        taskTable,
        eq(recurringTaskGroupTable.id, taskTable.recurringTaskGroupId),
      )
      .leftJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
      .where(sql`${recurringTaskGroupTable.initialStartDate} <= NOW()`)
      .groupBy(recurringTaskGroupTable.id, taskTable.id)
      .having(
        or(
          eq(count(assignmentTable.id), 0),
          sql`NOW() >= MAX(${assignmentTable.createdAt} + ${recurringTaskGroupTable.interval})`,
        ),
      );

    return taskIdsToCreateAssignmentsFor;
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbAddAssignments({
  assignments,
}: {
  assignments: CreateAssignment[];
}) {
  await db.insert(assignmentTable).values(assignments);
}
