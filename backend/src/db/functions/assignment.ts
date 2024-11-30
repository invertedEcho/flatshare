import { and, count, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '..';
import {
  AssignmentState,
  InsertAssignment,
  assignmentTable,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  userTable,
  userUserGroupTable,
} from '../schema';
import { z } from 'zod';
import { defaultPostgresIntervalSchema } from 'src/utils/interval';
import { AssignmentResponse } from 'src/assignment/types';

// FIXME: This function doesn't only return the assignments from the current interval, but just all assignments newer than `NOW()` minus
// the interval, so let there be a weekly recurring taskgroup, let it be wednesday , it would also return all assignments that are newer
// than last wednesday, but instead we just want assignment that have been created in the current period, so all assignments >= Monday 00:00.
//
// Alternatively, we need to make sure that the assignments `createdAt` date is only ever at the beginning of an interval, so for example always on Monday
//  for a weekly task group. If that were the case this function would correctly even in the current state.
export async function dbGetAssignmentsForUserGroupFromCurrentInterval(
  userGroupId: number,
): Promise<AssignmentResponse[]> {
  const assignmentsFromCurrentInterval = await db
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
        eq(userUserGroupTable.groupId, userGroupId),
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

  return assignmentsFromCurrentInterval.map((assignment) => {
    // This is dirty. Drizzle returns dueDate as a string with no timezone information, so I need to add the 'Z' to make the date constructor interpret it as UTC.
    const date = new Date(assignment.dueDate + 'Z');
    return {
      ...assignment,
      dueDate: assignment.isOneOff ? null : date,
    };
  });
}

export async function dbChangeAssignmentState(
  assignmentId: number,
  state: AssignmentState,
) {
  await db
    .update(assignmentTable)
    .set({ state })
    .where(eq(assignmentTable.id, assignmentId));
}

const recurringTaskGroupToAssignSchema = z.object({
  recurringTaskGroupId: z.number(),
  taskIds: z.number().array(),
  taskGroupInitialStartDate: z.date(),
  isInFirstInterval: z.boolean(),
  interval: defaultPostgresIntervalSchema,
  userIdsOfRecurringTaskGroup: z.number().array(),
  assignmentOrdinals: z.number().array(),
  userIdOfLatestAssignment: z.number().nullable(),
});

export type RecurringTaskGroupToAssign = z.infer<
  typeof recurringTaskGroupToAssignSchema
>;

export async function dbGetRecurringTaskGroupsToAssignForCurrentInterval({
  overrideNow = new Date(),
}: {
  overrideNow?: Date;
}): Promise<RecurringTaskGroupToAssign[]> {
  const overrideNowString = overrideNow.toISOString();

  const subQueryLatestAssignment = db
    .select({ userId: assignmentTable.userId, taskId: taskTable.id })
    .from(assignmentTable)
    .innerJoin(taskTable, eq(taskTable.id, assignmentTable.taskId))
    .orderBy(desc(assignmentTable.createdAt))
    .limit(1)
    .as('subquery_latest_assignment');

  const recurringTaskGroupsToAssign = await db
    .select({
      recurringTaskGroupId: recurringTaskGroupTable.id,
      taskIds: sql`array_agg(distinct(${taskTable.id}))`,
      taskGroupInitialStartDate: recurringTaskGroupTable.initialStartDate,
      isInFirstInterval: sql<boolean>`CAST(${overrideNowString} AS timestamp) < (${recurringTaskGroupTable.initialStartDate} + ${recurringTaskGroupTable.interval})`,
      interval: recurringTaskGroupTable.interval,
      userIdsOfRecurringTaskGroup: sql<
        number[]
      >`array_agg(distinct(${recurringTaskGroupUserTable.userId}))`,
      assignmentOrdinals: sql<
        number[]
      >`array_agg(distinct(${recurringTaskGroupUserTable.assignmentOrdinal}))`,
      userIdOfLatestAssignment: subQueryLatestAssignment.userId,
    })
    .from(recurringTaskGroupTable)
    .innerJoin(
      taskTable,
      eq(taskTable.recurringTaskGroupId, recurringTaskGroupTable.id),
    )
    .innerJoin(
      recurringTaskGroupUserTable,
      eq(
        recurringTaskGroupUserTable.recurringTaskGroupId,
        recurringTaskGroupTable.id,
      ),
    )
    .leftJoin(assignmentTable, eq(assignmentTable.taskId, taskTable.id))
    .leftJoin(
      subQueryLatestAssignment,
      eq(taskTable.id, subQueryLatestAssignment.taskId),
    )
    .where(
      sql`${recurringTaskGroupTable.initialStartDate} <= CAST(${overrideNowString} AS timestamp)`,
    )
    .groupBy(
      recurringTaskGroupTable.id,
      taskTable.id,
      subQueryLatestAssignment.userId,
    )
    .having(
      or(
        eq(count(assignmentTable.id), 0),
        // TODO: make timezone dynamic
        /* When the last assignment was for example created at 2024-06-30 22:00:00 (in UTC, which would be 2024-07-01 00:00:00 in CEST), 
          this date plus one month would be 2024-07-30 22:00:00 (in UTC, which would be 2024-07-31 00:00:00 in CEST). 
          But actually, we want the resulting date that we compare the current time with to be 2024-08-01 00:00:00,
          so we need to convert the timestamps to the local time zone first. */
        sql`CAST(${overrideNowString} AS timestamp) AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' >= MAX(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${recurringTaskGroupTable.interval})`,
      ),
    );

  // parse with runtime validation library zod as we use type-unsafe raw sql drizzle function
  const parsedRecurringTaskGroupsToAssign = z
    .array(recurringTaskGroupToAssignSchema)
    .parse(recurringTaskGroupsToAssign);

  return parsedRecurringTaskGroupsToAssign;
}

export async function dbInsertAssignments({
  assignments,
}: {
  assignments: InsertAssignment[];
}) {
  await db.insert(assignmentTable).values(assignments);
}
