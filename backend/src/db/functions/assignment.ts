import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  isNull,
  or,
  sql,
} from 'drizzle-orm';
import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  InsertAssignment,
  SelectAssignment,
  assignmentTable,
  recurringTaskGroupTable,
  taskTable,
  userTable,
  userUserGroupTable,
} from '../schema';
import { z } from 'zod';
import { defaultPostgresIntervalSchema } from 'src/utils/interval';

// FIXME: This function doesn't only return the assignments from the current interval, but just all assignments newer than `NOW()` minus
// the interval, so let there be a weekly recurring taskgroup, let it be wednesday , it would also return all assignments that are newer
// than last wednesday, but instead we just want assignment that have been created in the current period, so all assignments >= Monday 00:00.
//
// Alternatively, we need to make sure that the assignments `createdAt` date is only ever at the beginning of an interval, so for example always on Monday
//  for a weekly task group. If that were the case this function would correctly even in the current state.

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

export async function dbGetAssignmentsForTaskGroup({
  taskGroupId,
  limit,
}: {
  taskGroupId: number;
  limit?: number;
}): Promise<SelectAssignment[]> {
  const result = db
    .select({ ...getTableColumns(assignmentTable) })
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

// FIXME: This function doesn't only return the assignments from the current interval, but just all assignments newer than `NOW()` minus
// the interval, so let there be a weekly recurring taskgroup, let it be wednesday , it would also return all assignments that are newer
// than last wednesday, but instead we just want assignment that have been created in the current period, so all assignments >= Monday 00:00.
//
// Alternatively, we need make sure that the assignments `createdAt` date is only ever at the beginning of an interval, so for example always on Monday
//  for a weekly task group. If that were the case this function would correctly even in the current state.

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
      // TODO: convert to local time zone before comparison
      sql`${assignmentTable.createdAt} >= NOW() - ${recurringTaskGroupTable.interval} AND ${recurringTaskGroupTable.id} = ${taskGroupId}`,
    );

  return currentAssignments;
}

const taskToAssignSchema = z.object({
  taskId: z.number(),
  taskGroupId: z.number(),
  taskGroupInitialStartDate: z.date(),
  isInFirstInterval: z.boolean(),
  interval: defaultPostgresIntervalSchema,
});

export type TaskToAssign = z.infer<typeof taskToAssignSchema>;

// TODO: doesnt seem like you can (should?) mock the time of the database, so we use this argument instead of `NOW()`
export async function dbGetTasksToAssignForCurrentInterval({
  currentTime = new Date(),
}: {
  currentTime?: Date;
}): Promise<TaskToAssign[]> {
  try {
    const currentTimeString = currentTime.toISOString();

    // Get all tasks that either have no assignments yet or don't have an assignment in the current period
    const tasksToAssign = await db
      .select({
        taskId: taskTable.id,
        taskGroupId: recurringTaskGroupTable.id,
        taskGroupInitialStartDate: recurringTaskGroupTable.initialStartDate,
        isInFirstInterval: sql<boolean>`CAST(${currentTimeString} AS timestamp) < (${recurringTaskGroupTable.initialStartDate} + ${recurringTaskGroupTable.interval})`,
        interval: recurringTaskGroupTable.interval,
      })
      .from(recurringTaskGroupTable)
      .innerJoin(
        taskTable,
        eq(recurringTaskGroupTable.id, taskTable.recurringTaskGroupId),
      )
      .leftJoin(assignmentTable, eq(taskTable.id, assignmentTable.taskId))
      .where(
        sql`${recurringTaskGroupTable.initialStartDate} <= CAST(${currentTimeString} AS timestamp)`,
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
          sql`CAST(${currentTimeString} AS timestamp) AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' >= MAX(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${recurringTaskGroupTable.interval})`,
        ),
      );

    // drizzle returns the interval as type string, so we use zod to "convert" them to the correct type
    const parsedTasksToAssign = z
      .array(taskToAssignSchema)
      .safeParse(tasksToAssign);

    if (!parsedTasksToAssign.success) {
      // TODO: We need a logger connected to a logdrain, and a monitoring dashboard. This most likely never happens, but if it does,
      // it would be quite critical.
      console.error({
        msg: 'Could not parse tasksToAssign result set from database to the expected type.',
      });
      return [];
    }

    return parsedTasksToAssign.data;
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
