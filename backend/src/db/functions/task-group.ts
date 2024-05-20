import { CreateTaskGroup } from 'src/task-group.controller';
import { db } from '..';
import { taskGroupTable, taskGroupUserTable } from '../schema';

export async function dbGetTaskGroups() {
  return await db.select().from(taskGroupTable);
}

export async function dbCreateTaskGroup({
  title,
  description,
  intervalDays,
  userIds,
  initialStartDate,
}: CreateTaskGroup) {
  try {
    const res = await db
      .insert(taskGroupTable)
      .values({
        title,
        description,
        interval: `${intervalDays} days`,
        initialStartDate: new Date(initialStartDate),
      })
      .returning({ taskGroupId: taskGroupTable.id });

    const { taskGroupId } = res[0];

    await db.insert(taskGroupUserTable).values(
      userIds.map((userId) => ({
        taskGroupId,
        userId,
      })),
    );
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
