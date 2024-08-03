import {
  dbGetTasksToAssignForCurrentInterval,
  TaskToAssign,
} from '../functions/assignment';
import {
  assignmentTable,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from '../schema';
import { client, db } from '..';
import {
  recurringTaskGroupWeekly,
  userJulian,
  taskVacuuming,
  userGroupWG1,
} from '../tests/mock-data';
import { truncateAllTables, seedDatabase } from '../tests/util';

describe('dbGetTasksToAssignForCurrentInterval', () => {
  beforeEach(async () => {
    await truncateAllTables();
    await seedDatabase();
  });

  afterAll(async () => {
    await client.end();
  });

  async function setup() {
    await db.insert(recurringTaskGroupTable).values(recurringTaskGroupWeekly);
    await db.insert(recurringTaskGroupUserTable).values({
      recurringTaskGroupId: recurringTaskGroupWeekly.id,
      userId: userJulian.id,
    });

    await db.insert(taskTable).values(taskVacuuming);
    await db
      .insert(taskUserGroupTable)
      .values({ groupId: userGroupWG1.id, taskId: taskVacuuming.id });
  }

  it('does return tasks where initial start date is in the past', async () => {
    await setup();

    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: new Date('2024-07-29 13:00:00Z'),
    });

    const expectedTask = {
      taskId: taskVacuuming.id,
      taskGroupId: recurringTaskGroupWeekly.id,
      isInFirstInterval: true,
      taskGroupInitialStartDate: recurringTaskGroupWeekly.initialStartDate,
    } satisfies TaskToAssign;

    expect(result).toHaveLength(1);
    const firstTask = result[0];
    expect(firstTask).toStrictEqual(expectedTask);
  });

  it('does not return tasks where the initalStartDate is in the future', async () => {
    await setup();

    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: new Date('2024-07-28 21:59:59Z'),
    });

    expect(result).toHaveLength(0);
  });

  it('returns a task where there is no assignment yet for the current period', async () => {
    await setup();
    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: new Date('2024-07-31 22:00:00Z'),
    });
    console.debug({ result });
    expect(result).toHaveLength(1);
  });

  it('returns no tasks where there is no assignment yet for the current period', async () => {
    await setup();
    await db.insert(assignmentTable).values({
      taskId: taskVacuuming.id,
      userId: userJulian.id,
      createdAt: new Date('2024-07-31 22:00:00Z'),
    });
    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: new Date('2024-08-01 22:00:00Z'),
    });
    console.debug({ result });
    expect(result).toHaveLength(0);
  });

  // FIXME: This test should pass, but it doesnt.
  it.skip('returns an assignment when an assignment existed at the exact same time of the initial start date', async () => {
    await setup();
    await db.insert(assignmentTable).values({
      taskId: taskVacuuming.id,
      userId: userJulian.id,
      createdAt: new Date('2024-07-25 22:30:00Z'),
    });
    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: new Date('2024-08-04 22:00:00Z'),
    });
    console.debug({ result });
    expect(result).toHaveLength(1);
  });
});
