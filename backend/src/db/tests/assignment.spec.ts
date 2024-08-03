import { dbGetTasksToAssignForCurrentInterval } from '../functions/assignment';
import {
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from '../schema';
import {
  recurringTaskGroupWeekly,
  taskVacuuming,
  userGroupWG1,
  userJulian,
} from './mock-data';
import { truncateAllTables, seedDatabase } from './util';
import { db } from '..';

describe('dbGetTasksToAssignForCurrentInterval', () => {
  beforeEach(async () => {
    await truncateAllTables();
    await seedDatabase();
  });
  afterAll(() => {
    jest.useRealTimers();
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

  it('returns tasks where the initalStartDate is less than or equal to the current date', async () => {
    await setup();

    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: recurringTaskGroupWeekly.initialStartDate,
    });

    expect(result).toHaveLength(1);
  });

  it('does not return tasks where the initalStartDate is in the future', async () => {
    await setup();

    const result = await dbGetTasksToAssignForCurrentInterval({
      currentTime: new Date('2024-07-28 21:59:59Z'),
    });

    expect(result).toHaveLength(0);
  });
});
