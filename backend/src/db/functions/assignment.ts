import { and, desc, eq, getTableColumns, isNull, or, sql } from 'drizzle-orm';
import { db } from '..';
import {
  AssignmentState,
  InsertAssignment,
  SelectAssignment,
  assignmentTable,
  taskGroupTable,
  taskTable,
  userTable,
  userUserGroupMappingTable,
} from '../schema';
import { AssignmentResponse } from 'src/assignment/types';

// FIXME: This function doesn't only return the assignments from the current interval, but just all assignments newer than `NOW()` minus
// the interval, so let there be a weekly task group, let it be wednesday , it would also return all assignments that are newer
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
      isOneOff: sql<boolean>`${taskTable.taskGroupId} IS NULL`,
      // TODO: make timezone dynamic
      dueDate: sql<string>`(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${taskGroupTable.interval}) AT TIME ZONE 'Europe/Berlin' AT TIME ZONE 'UTC' - interval '1 day'`,
      taskGroupId: taskGroupTable.id,
      taskGroupTitle: taskGroupTable.title,
    })
    .from(assignmentTable)
    .innerJoin(userTable, eq(assignmentTable.userId, userTable.id))
    .innerJoin(taskTable, eq(assignmentTable.taskId, taskTable.id))
    .innerJoin(
      userUserGroupMappingTable,
      and(
        eq(userUserGroupMappingTable.userGroupId, userGroupId),
        eq(userUserGroupMappingTable.userId, userTable.id),
      ),
    )
    .leftJoin(taskGroupTable, eq(taskTable.taskGroupId, taskGroupTable.id))
    // Only get assignments from the current interval
    .where(
      // TODO: make timezone dynamic
      and(
        or(
          sql`now() < (${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${taskGroupTable.interval}) AT TIME ZONE 'Europe/Berlin' AT TIME ZONE 'UTC'`,
          isNull(taskGroupTable.id),
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

export async function dbUpdateAssignmentState(
  assignmentId: number,
  state: AssignmentState,
) {
  await db
    .update(assignmentTable)
    .set({ state })
    .where(eq(assignmentTable.id, assignmentId));
}

export async function dbInsertAssignments({
  assignments,
}: {
  assignments: InsertAssignment[];
}) {
  await db.insert(assignmentTable).values(assignments);
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
