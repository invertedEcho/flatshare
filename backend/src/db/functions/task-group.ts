import { count, desc, eq, inArray, sql, or } from 'drizzle-orm';
import { db } from '..';
import {
  InsertTaskGroup,
  assignmentTable,
  taskGroupTable,
  taskGroupUserMappingTable,
  taskTable,
  taskUserGroupMappingTable,
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
      id: taskGroupTable.id,
      title: taskGroupTable.title,
      description: taskGroupTable.description,
      interval: taskGroupTable.interval,
    })
    .from(taskGroupTable)
    .where(eq(taskGroupTable.userGroupId, userGroupId))
    .leftJoin(taskTable, eq(taskTable.taskGroupId, taskGroupTable.id))
    .groupBy(taskTable.taskGroupId, taskGroupTable.id);
}

export async function dbCreateTaskGroup({
  title,
  description,
  interval,
  userIds,
  initialStartDate,
  userGroupId,
}: InsertTaskGroup & { userIds: number[] }) {
  const taskGroups = await db
    .insert(taskGroupTable)
    .values({
      title,
      description,
      interval,
      userGroupId,
      initialStartDate,
    })
    .returning();

  const taskGroup = taskGroups[0];

  if (taskGroup === undefined) {
    throw new Error('Failed to create task group');
  }
  await db.insert(taskGroupUserMappingTable).values(
    userIds.map((userId, index) => ({
      taskGroupId: taskGroup.id,
      userId,
      assignmentOrdinal: index,
    })),
  );
  return taskGroup;
}

export async function dbGetTasksOfTaskGroup(taskGroupId: number) {
  return await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.taskGroupId, taskGroupId));
}

export async function dbDeleteTaskGroup(taskGroupId: number) {
  await db
    .delete(taskGroupUserMappingTable)
    .where(eq(taskGroupUserMappingTable.taskGroupId, taskGroupId));
  const taskIds = (await dbGetTasksOfTaskGroup(taskGroupId)).map(
    (task) => task.id,
  );
  if (taskIds.length > 0) {
    await db
      .delete(assignmentTable)
      .where(inArray(assignmentTable.taskId, taskIds));
    await db
      .delete(taskUserGroupMappingTable)
      .where(inArray(taskUserGroupMappingTable.taskId, taskIds));
    await db.delete(taskTable).where(inArray(taskTable.id, taskIds));
  }
  await db.delete(taskGroupTable).where(eq(taskGroupTable.id, taskGroupId));
}

const taskGroupToAssignSchema = z.object({
  taskGroupId: z.number(),
  taskIds: z.number().array(),
  taskGroupInitialStartDate: z.date(),
  isInFirstInterval: z.boolean(),
  interval: defaultPostgresIntervalSchema,
  userIdsOfTaskGroup: z.number().array(),
  assignmentOrdinals: z.number().array(),
});

export type TaskGroupToAssign = z.infer<typeof taskGroupToAssignSchema>;

export async function dbGetTaskGroupsToAssignForCurrentInterval({
  overrideNow = new Date(),
}: {
  overrideNow?: Date;
}): Promise<TaskGroupToAssign[]> {
  const overrideNowString = overrideNow.toISOString();

  const taskGroupsToAssign = await db
    .select({
      taskGroupId: taskGroupTable.id,
      taskIds: sql`array_agg(distinct(${taskTable.id}))`,
      taskGroupInitialStartDate: taskGroupTable.initialStartDate,
      isInFirstInterval: sql<boolean>`CAST(${overrideNowString} AS timestamp) < (${taskGroupTable.initialStartDate} + ${taskGroupTable.interval})`,
      interval: taskGroupTable.interval,
      userIdsOfTaskGroup: sql<
        number[]
      >`array_agg(distinct(${taskGroupUserMappingTable.userId}))`,
      assignmentOrdinals: sql<
        number[]
      >`array_agg(distinct(${taskGroupUserMappingTable.assignmentOrdinal}))`,
    })
    .from(taskGroupTable)
    .innerJoin(taskTable, eq(taskTable.taskGroupId, taskGroupTable.id))
    .innerJoin(
      taskGroupUserMappingTable,
      eq(taskGroupUserMappingTable.taskGroupId, taskGroupTable.id),
    )
    .leftJoin(assignmentTable, eq(assignmentTable.taskId, taskTable.id))
    .where(
      sql`${taskGroupTable.initialStartDate} <= CAST(${overrideNowString} AS timestamp)`,
    )
    .groupBy(taskGroupTable.id, taskTable.id)
    .having(
      or(
        eq(count(assignmentTable.id), 0),
        // TODO: make timezone dynamic
        /* When the last assignment was for example created at 2024-06-30 22:00:00 (in UTC, which would be 2024-07-01 00:00:00 in CEST), 
          this date plus one month would be 2024-07-30 22:00:00 (in UTC, which would be 2024-07-31 00:00:00 in CEST). 
          But actually, we want the resulting date that we compare the current time with to be 2024-08-01 00:00:00,
          so we need to convert the timestamps to the local time zone first. */
        sql`CAST(${overrideNowString} AS timestamp) AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' >= MAX(${assignmentTable.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Berlin' + ${taskGroupTable.interval})`,
      ),
    );

  // parse with runtime validation library zod as we use type-unsafe raw sql drizzle function
  const parsedTaskGroupsToAssign = z
    .array(taskGroupToAssignSchema)
    .parse(taskGroupsToAssign);

  return parsedTaskGroupsToAssign;
}

export async function dbGetHighestAssignmentOrdinalForTaskGroup({
  taskGroupId,
}: {
  taskGroupId: number;
}) {
  const userWithHighestOrdinal = (
    await db
      .select()
      .from(taskGroupUserMappingTable)
      .where(eq(taskGroupUserMappingTable.taskGroupId, taskGroupId))
      .orderBy(desc(taskGroupUserMappingTable.assignmentOrdinal))
      .limit(1)
  )[0];

  return userWithHighestOrdinal?.assignmentOrdinal;
}

export async function dbGetTaskGroupsOfUserGroup({
  userGroupId,
}: {
  userGroupId: number;
}) {
  return await db
    .select()
    .from(taskGroupTable)
    .where(eq(taskGroupTable.userGroupId, userGroupId));
}
