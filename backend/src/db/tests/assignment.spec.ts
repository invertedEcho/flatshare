import 'dotenv/config';
import { testingDb } from '..';
import { dbGetTasksToAssignForCurrentInterval } from '../functions/assignment';
import {
  InsertRecurringTaskGroup,
  InsertTask,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from '../schema';
import { userGroupWG1, userJulian } from './mock-data';
import { clearDb, seedDatabase } from './util';

describe('dbGetTasksToAssignForCurrentInterval', () => {
  beforeEach(async () => {
    await clearDb(testingDb);
    await seedDatabase();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const recurringTaskGroupWeekly = {
    id: 1,
    initialStartDate: new Date('2024-07-28 22:00:00Z'),
    interval: '1 week',
    title: 'Every week',
    userGroupId: 1,
  } satisfies InsertRecurringTaskGroup;

  const taskVacuuming = {
    id: 1,
    title: 'Staubsaugen',
    createdAt: new Date(),
    description: 'Boden saugen',
    recurringTaskGroupId: recurringTaskGroupWeekly.id,
  } satisfies InsertTask;

  // Insert a task group and a task
  async function setup() {
    await testingDb
      .insert(recurringTaskGroupTable)
      .values(recurringTaskGroupWeekly);
    await testingDb.insert(recurringTaskGroupUserTable).values({
      recurringTaskGroupId: recurringTaskGroupWeekly.id,
      userId: userJulian.id,
    });

    await testingDb.insert(taskTable).values(taskVacuuming);
    await testingDb
      .insert(taskUserGroupTable)
      .values({ groupId: userGroupWG1.id, taskId: taskVacuuming.id });
  }

  it('returns tasks where the initalStartDate is less than or equal to the current date', async () => {
    await setup();

    const result = await dbGetTasksToAssignForCurrentInterval(
      recurringTaskGroupWeekly.initialStartDate,
    );

    expect(result).toHaveLength(1);
  });

  it('does not return tasks where the initalStartDate is in the future', async () => {
    await setup();

    const result = await dbGetTasksToAssignForCurrentInterval(
      new Date('2024-07-28 21:59:59Z'),
    );

    expect(result).toHaveLength(0);
  });
});
