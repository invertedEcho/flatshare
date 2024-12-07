import { eq, and } from 'drizzle-orm';
import { db } from '..';
import {
  SelectTask,
  assignmentTable,
  taskUserGroupMappingTable,
  taskTable,
  taskGroupTable,
  SelectTaskGroup,
} from '../schema';
import { OneOffTask, UpdateTask } from 'src/tasks/task.controller';
import {
  DefaultPostgresInterval,
  getDescriptiveNameFromPostgresInterval,
} from 'src/utils/interval';
import { dbCreateTaskGroup } from './task-group';
import { dbGetUsersOfUserGroup } from './user-group';
import { getStartOfInterval } from 'src/utils/date';

export async function dbGetAllTasks({
  userGroupId,
}: {
  userGroupId?: number;
}): Promise<SelectTask[]> {
  const query = db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      description: taskTable.description,
      createdAt: taskTable.createdAt,
      taskGroupId: taskTable.taskGroupId,
    })
    .from(taskTable);
  if (userGroupId === undefined) {
    return await query;
  }
  return await query
    .innerJoin(
      taskUserGroupMappingTable,
      eq(taskUserGroupMappingTable.taskId, taskTable.id),
    )
    .where(eq(taskUserGroupMappingTable.userGroupId, userGroupId));
}

export async function dbGetTaskById(taskId: number) {
  const queryResult = await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.id, taskId))
    .limit(1);
  return queryResult[0];
}

type CreateRecurringTask = {
  title: string;
  description?: string;
  interval: DefaultPostgresInterval;
  userGroupId: number;
};

export async function dbCreateRecurringTask({
  title,
  description,
  userGroupId,
  interval,
}: CreateRecurringTask): Promise<
  SelectTask & { maybeCreatedTaskGroup: SelectTaskGroup }
> {
  const taskGroupTitle = getDescriptiveNameFromPostgresInterval(interval);

  const usersOfUserGroup = await dbGetUsersOfUserGroup({ userGroupId });

  const maybeExistingTaskGroup = (
    await db
      .select()
      .from(taskGroupTable)
      .where(
        and(
          eq(taskGroupTable.interval, interval),
          eq(taskGroupTable.userGroupId, userGroupId),
        ),
      )
      .limit(1)
  )[0];

  const taskGroupId =
    maybeExistingTaskGroup === undefined
      ? await dbCreateTaskGroup({
          interval,
          title: taskGroupTitle,
          userIds: usersOfUserGroup.map(
            (userOfUserGroup) => userOfUserGroup.userId,
          ),
          initialStartDate: getStartOfInterval(interval),
          userGroupId,
        })
      : maybeExistingTaskGroup;

  const task = (
    await db
      .insert(taskTable)
      .values({
        title,
        description,
        taskGroupId: taskGroupId.id,
      })
      .returning()
  )[0];

  if (task === undefined) {
    throw new Error('Failed to create recurring task.');
  }

  await db
    .insert(taskUserGroupMappingTable)
    .values({ taskId: task.id, userGroupId });
  // TODO: this is really bad, this is an impure side effect.
  // when the frontend creates a recurring task for an interval where no task group exists yet,
  // we manually create this task group here, but the frontend needs to know about this change, so we will return here and include it in the response
  // we could alternatively just refetch after creating task, but that feels even worse
  // we could perhaps always have a static list of task groups that always exist, e.g. the default ones, and you cant delete those
  // yeah now where i think about that thats probably the best idea
  return { ...task, maybeCreatedTaskGroup: taskGroupId };
}

export async function dbDeleteTask({ taskId }: { taskId: number }) {
  await db.delete(assignmentTable).where(eq(assignmentTable.taskId, taskId));
  await db
    .delete(taskUserGroupMappingTable)
    .where(eq(taskUserGroupMappingTable.taskId, taskId));
  await db.delete(taskTable).where(eq(taskTable.id, taskId));
}

export async function dbUpdateTask({
  description,
  taskGroupId,
  title,
  id,
}: UpdateTask & { id: number }) {
  await db
    .update(taskTable)
    .set({ title, description, taskGroupId })
    .where(eq(taskTable.id, id));
}

export async function dbCreateOneOffTask({
  title,
  description,
  userIds,
  userGroupId,
}: OneOffTask & { userGroupId: number }) {
  const tasks = await db
    .insert(taskTable)
    .values({ title, description })
    .returning();
  const task = tasks[0];
  if (task === undefined) {
    throw new Error('Failed to create one off task.');
  }

  const hydratedAssignments = userIds.map((userId) => {
    return {
      taskId: task.id,
      userId,
    };
  });
  await db
    .insert(taskUserGroupMappingTable)
    .values({ taskId: task.id, userGroupId });

  await db.insert(assignmentTable).values(hydratedAssignments);
  return task;
}
