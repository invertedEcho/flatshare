import { and, count, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  InsertAssignment,
  assignmentTable,
  recurringTaskGroupTable,
  taskTable,
  userTable,
  userUserGroupTable,
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

// TODO: I haven't found a better way to mock the date than just passing it in here as a JS date instead of using `NOW()` in the queries.
// Same for the db implementation.
// Research if there is a better way.
export async function dbGetTasksToAssignForCurrentInterval({
  currentTime = new Date(),
  dbImplementation = db,
}: {
  currentTime: Date;
  dbImplementation: PostgresJsDatabase;
}) {
  try {
    // Get all tasks that either have no assignments yet or don't have an assignment in the current period
    const taskIdsToCreateAssignmentsFor = await dbImplementation
      .select({
        taskId: taskTable.id,
        taskGroupId: recurringTaskGroupTable.id,
        taskGroupInitialStartDate: recurringTaskGroupTable.initialStartDate,
        isInFirstInterval: sql<boolean>`${currentTime?.toISOString()} < (${recurringTaskGroupTable.initialStartDate} + ${recurringTaskGroupTable.interval})`,
      })
      .from(recurringTaskGroupTable)
      .innerJoin(
        taskTable,
        eq(recurringTaskGroupTable.id, taskTable.recurringTaskGroupId),
      )
      .leftJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
      .where(
        sql`${recurringTaskGroupTable.initialStartDate} <= ${currentTime?.toISOString()}`,
      )
      .groupBy(recurringTaskGroupTable.id, taskTable.id)
      .having(
        or(
          eq(count(assignmentTable.id), 0),
          // TODO: make timezone dynamic
          /* When the last assignment was for example created at 2024-06-30 22:00:00 (in UTC, which would be 2024-07-01 00:00:00 in CEST), 
          this date plus one month would be 2024-07-30 22:00:00 (in UTC, which would be 2024-07-31 00:00:00 in CEST). 
          But actually, we want the resulting date that we compare the current time with to be 2024-08-01 00:00:00,
          so we need to convert the timestamps to the local time zone first. */
          sql`${currentTime?.toISOString()} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' >= MAX(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${recurringTaskGroupTable.interval})`,
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
  assignments: InsertAssignment[];
}) {
  await db.insert(assignmentTable).values(assignments);
}
