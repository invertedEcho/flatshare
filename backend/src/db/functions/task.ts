import { eq, and } from 'drizzle-orm';
import { db } from '..';
import {
  SelectTask,
  assignmentTable,
  taskUserGroupTable,
  taskTable,
  recurringTaskGroupTable,
} from '../schema';
import {
  CreateRecurringTask,
  OneOffTask,
  UpdateTask,
} from 'src/tasks/task.controller';
import { getTaskGroupTitleFromInterval } from 'src/utils/interval';

export async function dbGetAllTasks({
  groupId,
}: {
  groupId?: number;
}): Promise<SelectTask[]> {
  const query = db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      description: taskTable.description,
      createdAt: taskTable.createdAt,
      recurringTaskGroupId: taskTable.recurringTaskGroupId,
    })
    .from(taskTable);
  if (groupId === undefined) {
    return await query;
  }
  return await query
    .innerJoin(taskUserGroupTable, eq(taskUserGroupTable.taskId, taskTable.id))
    .where(eq(taskUserGroupTable.groupId, groupId));
}

export async function dbGetTaskById(taskId: number) {
  const queryResult = await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.id, taskId))
    .limit(1);
  return queryResult[0];
}

export async function dbCreateRecurringTask({
  title,
  description,
  userGroupId,
  interval,
}: CreateRecurringTask) {
  const recurringTaskGroup = (
    await db
      .select()
      .from(recurringTaskGroupTable)
      .where(
        and(
          eq(recurringTaskGroupTable.interval, interval),
          eq(recurringTaskGroupTable.userGroupId, userGroupId),
        ),
      )
      .limit(1)
  )[0];

  const recurringTaskGroupTitle = getTaskGroupTitleFromInterval(interval);
  if (recurringTaskGroupTitle === undefined) {
    throw new Error('Unsupported interval while creating a recurring task');
  }
  const recurringTaskGroupId =
    recurringTaskGroup === undefined
      ? (
          await db
            .insert(recurringTaskGroupTable)
            .values({
              title: recurringTaskGroupTitle,
              interval,
              // TODO: add function here
              initialStartDate: new Date(),
              userGroupId,
            })
            .returning()
        )[0]?.id
      : recurringTaskGroup.id;

  if (recurringTaskGroupId === undefined) {
    throw new Error(
      'Failed to get or create task group when creating a recurring task.',
    );
  }

  const task = (
    await db
      .insert(taskTable)
      .values({
        title,
        description,
        recurringTaskGroupId,
      })
      .returning()
  )[0];

  if (task === undefined) {
    throw new Error('Failed to create recurring task.');
  }

  await db
    .insert(taskUserGroupTable)
    .values({ taskId: task.id, groupId: userGroupId });
}

export async function dbDeleteTask({ taskId }: { taskId: number }) {
  await db.delete(assignmentTable).where(eq(assignmentTable.taskId, taskId));
  await db
    .delete(taskUserGroupTable)
    .where(eq(taskUserGroupTable.taskId, taskId));
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
    .set({ title, description, recurringTaskGroupId: taskGroupId })
    .where(eq(taskTable.id, id));
}

export async function dbCreateOneOffTask({
  title,
  description,
  userIds,
  groupId,
}: OneOffTask & { groupId: number }) {
  const tasks = await db
    .insert(taskTable)
    .values({ title, description })
    .returning({ taskId: taskTable.id });
  const task = tasks[0];
  if (task === undefined) {
    throw new Error('Failed to create one off task.');
  }

  const hydratedAssignments = userIds.map((userId) => {
    return {
      taskId: task.taskId,
      userId,
    };
  });
  await db.insert(taskUserGroupTable).values({ taskId: task.taskId, groupId });

  await db.insert(assignmentTable).values(hydratedAssignments);
}
