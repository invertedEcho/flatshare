import {
  dbGetRecurringTaskGroupsToAssignForCurrentInterval,
  RecurringTaskGroupToAssign,
} from '../functions/assignment';
import { assignmentTable } from '../schema';
import { client, db } from '..';
import {
  recurringTaskGroupWeekly,
  userJulian,
  taskVacuuming,
  mockRecurringTaskGroupUserValues,
} from '../tests/mock-data';
import {
  truncateAllTables,
  seedDatabaseWithUserData,
  seedDatabaseWithTaskData,
} from '../tests/util';

const userIdsOfRecurringTaskGroup = mockRecurringTaskGroupUserValues.map(
  (value) => value.userId,
);
const assignmentOrdinals = mockRecurringTaskGroupUserValues.map(
  (value) => value.assignmentOrdinal,
);

describe('dbGetTasksToAssignForCurrentInterval', () => {
  beforeEach(async () => {
    await truncateAllTables();
    await seedDatabaseWithUserData();
  });

  afterAll(async () => {
    await truncateAllTables();
    // cleanup the client, else jest hangs
    await client.end();
  });

  it('does return tasks where initial start date is in the past', async () => {
    await seedDatabaseWithTaskData();

    const result = await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
      overrideNow: new Date('2024-07-29T13:00:00Z'),
    });

    const expectedRecurringTaskGroup = {
      taskIds: [taskVacuuming.id],
      recurringTaskGroupId: recurringTaskGroupWeekly.id,
      isInFirstInterval: true,
      taskGroupInitialStartDate: recurringTaskGroupWeekly.initialStartDate,
      interval: '7 days',
      userIdsOfRecurringTaskGroup,
      assignmentOrdinals,
      userIdOfLatestAssignment: null,
    } satisfies RecurringTaskGroupToAssign;

    expect(result).toHaveLength(1);
    const firstRecurringTaskGroup = result[0];
    expect(firstRecurringTaskGroup).toStrictEqual(expectedRecurringTaskGroup);
  });

  it('does not return tasks where the initalStartDate is in the future', async () => {
    await seedDatabaseWithTaskData();

    const result = await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
      overrideNow: new Date('2024-07-28 21:59:59Z'),
    });

    expect(result).toHaveLength(0);
  });

  it('returns a task where there are no assignments yet', async () => {
    await seedDatabaseWithTaskData();

    const expectedTask = {
      taskIds: [taskVacuuming.id],
      recurringTaskGroupId: recurringTaskGroupWeekly.id,
      isInFirstInterval: true,
      taskGroupInitialStartDate: recurringTaskGroupWeekly.initialStartDate,
      interval: '7 days',
      userIdsOfRecurringTaskGroup,
      assignmentOrdinals,
      userIdOfLatestAssignment: null,
    } satisfies RecurringTaskGroupToAssign;

    const result = await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
      overrideNow: new Date('2024-07-31 22:00:00Z'),
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual(expectedTask);
  });

  it('returns no tasks where there is already an assignment for the current period', async () => {
    await seedDatabaseWithTaskData();
    await db.insert(assignmentTable).values({
      taskId: taskVacuuming.id,
      userId: userJulian.id,
      createdAt: new Date('2024-07-28 22:00:00Z'),
    });
    const result = await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
      overrideNow: new Date('2024-08-04 21:59:00Z'),
    });
    expect(result).toHaveLength(0);
  });

  it('returns a task for which there exists an assignment in the previous period', async () => {
    await seedDatabaseWithTaskData();
    const expectedTask = {
      taskIds: [taskVacuuming.id],
      recurringTaskGroupId: recurringTaskGroupWeekly.id,
      isInFirstInterval: false,
      taskGroupInitialStartDate: recurringTaskGroupWeekly.initialStartDate,
      interval: '7 days',
      userIdsOfRecurringTaskGroup,
      assignmentOrdinals,
      userIdOfLatestAssignment: userJulian.id,
    } satisfies RecurringTaskGroupToAssign;

    await db.insert(assignmentTable).values({
      taskId: taskVacuuming.id,
      userId: userJulian.id,
      createdAt: new Date('2024-07-28 22:00:00Z'),
    });
    const result = await dbGetRecurringTaskGroupsToAssignForCurrentInterval({
      overrideNow: new Date('2024-08-04 22:00:00Z'),
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual(expectedTask);
  });
});
