import { count, desc, eq, inArray, sql, or } from 'drizzle-orm';
import { db } from '..';
import {
  InsertRecurringTaskGroup,
  assignmentTable,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from '../schema';
import { z } from 'zod';
import { defaultPostgresIntervalSchema } from 'src/utils/interval';

export async function dbGetTaskGroups({
  userGroupId,
}: {
  userGroupId: number;
}) {
  return await db
    .select({
      id: recurringTaskGroupTable.id,
      title: recurringTaskGroupTable.title,
      description: recurringTaskGroupTable.description,
      interval: recurringTaskGroupTable.interval,
    })
    .from(recurringTaskGroupTable)
    .where(eq(recurringTaskGroupTable.userGroupId, userGroupId))
    .leftJoin(
      taskTable,
      eq(taskTable.recurringTaskGroupId, recurringTaskGroupTable.id),
    )
    .groupBy(taskTable.recurringTaskGroupId, recurringTaskGroupTable.id);
}

export async function dbCreateTaskGroup({
  title,
  description,
  interval,
  userIds,
  initialStartDate,
  userGroupId,
}: InsertRecurringTaskGroup & { userIds: number[] }) {
  const recurringTaskGroups = await db
    .insert(recurringTaskGroupTable)
    .values({
      title,
      description,
      interval,
      userGroupId,
      initialStartDate,
    })
    .returning();

  const recurringTaskGroup = recurringTaskGroups[0];

  if (recurringTaskGroup === undefined) {
    throw new Error('Failed to create recurring task group');
  }
  await db.insert(recurringTaskGroupUserTable).values(
    userIds.map((userId, index) => ({
      recurringTaskGroupId: recurringTaskGroup.id,
      userId,
      assignmentOrdinal: index,
    })),
  );
  return recurringTaskGroup;
}

export async function dbGetTasksOfTaskGroup(taskGroupId: number) {
  return await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.recurringTaskGroupId, taskGroupId));
}

export async function dbDeleteTaskGroup(taskGroupId: number) {
  await db
    .delete(recurringTaskGroupUserTable)
    .where(eq(recurringTaskGroupUserTable.recurringTaskGroupId, taskGroupId));
  const taskIds = (await dbGetTasksOfTaskGroup(taskGroupId)).map(
    (task) => task.id,
  );
  if (taskIds.length > 0) {
    await db
      .delete(assignmentTable)
      .where(inArray(assignmentTable.taskId, taskIds));
    await db
      .delete(taskUserGroupTable)
      .where(inArray(taskUserGroupTable.taskId, taskIds));
    await db.delete(taskTable).where(inArray(taskTable.id, taskIds));
  }
  await db
    .delete(recurringTaskGroupTable)
    .where(eq(recurringTaskGroupTable.id, taskGroupId));
}

const recurringTaskGroupToAssignSchema = z.object({
  recurringTaskGroupId: z.number(),
  taskIds: z.number().array(),
  taskGroupInitialStartDate: z.date(),
  isInFirstInterval: z.boolean(),
  interval: defaultPostgresIntervalSchema,
  userIdsOfRecurringTaskGroup: z.number().array(),
  assignmentOrdinals: z.number().array(),
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
    .where(
      sql`${recurringTaskGroupTable.initialStartDate} <= CAST(${overrideNowString} AS timestamp)`,
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
        sql`CAST(${overrideNowString} AS timestamp) AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' >= MAX(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${recurringTaskGroupTable.interval})`,
      ),
    );

  // parse with runtime validation library zod as we use type-unsafe raw sql drizzle function
  const parsedRecurringTaskGroupsToAssign = z
    .array(recurringTaskGroupToAssignSchema)
    .parse(recurringTaskGroupsToAssign);

  return parsedRecurringTaskGroupsToAssign;
}

export async function dbGetHighestAssignmentOrdinalForTaskGroup({
  recurringTaskGroupId,
}: {
  recurringTaskGroupId: number;
}) {
  const userWithHighestOrdinal = (
    await db
      .select()
      .from(recurringTaskGroupUserTable)
      .where(
        eq(
          recurringTaskGroupUserTable.recurringTaskGroupId,
          recurringTaskGroupId,
        ),
      )
      .orderBy(desc(recurringTaskGroupUserTable.assignmentOrdinal))
      .limit(1)
  )[0];

  return userWithHighestOrdinal?.assignmentOrdinal;
}
