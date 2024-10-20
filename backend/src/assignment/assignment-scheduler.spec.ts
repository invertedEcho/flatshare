import { client, db } from 'src/db';
import {
  assignmentTable,
  InsertAssignment,
  InsertRecurringTaskGroup,
  InsertTask,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from 'src/db/schema';
import {
  mockRecurringTaskGroupUserValues,
  taskVacuuming,
  userGroupWG1,
  userJulian,
} from 'src/db/tests/mock-data';
import { seedDatabaseWithUserData, truncateAllTables } from 'src/db/tests/util';
import { AssignmentSchedulerService } from './assignment-scheduler.service';
import { getStartOfInterval } from 'src/utils/date';
import { desc } from 'drizzle-orm';

describe('Assignment scheduler', () => {
  const assignmentSchedulerService = new AssignmentSchedulerService();

  beforeEach(async () => {
    await truncateAllTables();
    await seedDatabaseWithUserData();
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterAll(async () => {
    await truncateAllTables();
    // cleanup the client, else jest hangs
    await client.end();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sets assignment creation date to start of interval when task is created in middle of interval', async () => {
    const recurringTaskGroupWeekly = {
      id: 1,
      initialStartDate: new Date('2024-08-25 22:00:00Z'),
      interval: '1 week',
      title: 'Every week',
      userGroupId: 1,
    } satisfies InsertRecurringTaskGroup;

    // Create task group with initialstartdate Monday in week 1
    await db.insert(recurringTaskGroupTable).values(recurringTaskGroupWeekly);
    await db.insert(recurringTaskGroupUserTable).values({
      recurringTaskGroupId: recurringTaskGroupWeekly.id,
      userId: userJulian.id,
      assignmentOrdinal: 2,
    });

    // Create new Task
    await db.insert(taskTable).values(taskVacuuming);
    await db
      .insert(taskUserGroupTable)
      .values({ groupId: userGroupWG1.id, taskId: taskVacuuming.id });

    // Run scheduler function at Wednesday in week 2
    jest.setSystemTime(new Date('2024-09-03 22:00:00Z'));
    await assignmentSchedulerService.handleCron();

    // check that assignment with created at of Monday in week 2 exists
    const assignments = await db.select().from(assignmentTable);
    expect(assignments).toHaveLength(1);
    expect(assignments[0]?.createdAt).toStrictEqual(
      new Date('2024-09-01 22:00:00Z'),
    );
  });

  it('correctly inserts assignments to user in right order after after everyone was assigned once', async () => {
    jest.setSystemTime(new Date('2024-09-10 08:00:00:Z'));
    const intervalStr = '7 days';
    const mockRecurringTaskGroup = {
      title: 'Weekly Tasks',
      interval: intervalStr,
      userGroupId: userGroupWG1.id,
      initialStartDate: getStartOfInterval(intervalStr),
    } satisfies InsertRecurringTaskGroup;
    const insertedRecurringTaskGroup = (
      await db
        .insert(recurringTaskGroupTable)
        .values(mockRecurringTaskGroup)
        .returning()
    )[0];
    if (insertedRecurringTaskGroup === undefined) {
      throw new Error('Did not insert mock recurring task group');
    }
    const mockTask = {
      title: 'Staubsaugen',
      recurringTaskGroupId: insertedRecurringTaskGroup.id,
    } satisfies InsertTask;
    const insertedTask = (
      await db.insert(taskTable).values(mockTask).returning()
    )[0];

    if (insertedTask === undefined) {
      throw new Error('Did not insert mock task');
    }

    const firstUserId = mockRecurringTaskGroupUserValues[0]?.userId;
    if (firstUserId === undefined) {
      throw new Error(
        'mock recurring task group user values did not contain expected data.',
      );
    }
    const firstAssignment = {
      taskId: insertedTask.id,
      userId: firstUserId,
      createdAt: new Date('2024-09-08 22:00:00Z'),
      state: 'completed',
    } satisfies InsertAssignment;

    const secondUserId = mockRecurringTaskGroupUserValues[1]?.userId;
    if (secondUserId === undefined) {
      throw new Error(
        'mock recurring task group user values did not contain expected data.',
      );
    }
    const secondAssignment = {
      taskId: insertedTask.id,
      userId: secondUserId,
      createdAt: new Date('2024-09-15 22:00:00Z'),
      state: 'completed',
    } satisfies InsertAssignment;

    const thirdUserId = mockRecurringTaskGroupUserValues[2]?.userId;
    if (thirdUserId === undefined) {
      throw new Error(
        'mock recurring task group user values did not contain expected data.',
      );
    }
    const thirdAssignment = {
      taskId: insertedTask.id,
      userId: thirdUserId,
      createdAt: new Date('2024-09-22 22:00:00Z'),
      state: 'completed',
    } satisfies InsertAssignment;

    await db.insert(recurringTaskGroupUserTable).values([
      {
        recurringTaskGroupId: insertedRecurringTaskGroup.id,
        userId: firstUserId,
        assignmentOrdinal: 0,
      },
      {
        recurringTaskGroupId: insertedRecurringTaskGroup.id,
        userId: secondUserId,
        assignmentOrdinal: 1,
      },
      {
        recurringTaskGroupId: insertedRecurringTaskGroup.id,
        userId: thirdUserId,
        assignmentOrdinal: 2,
      },
    ]);

    await db
      .insert(assignmentTable)
      .values([firstAssignment, secondAssignment, thirdAssignment]);

    jest.setSystemTime(new Date('2024-10-05 14:00:00Z'));

    await assignmentSchedulerService.handleCron();

    const firstExpectedAssignment = (
      await db
        .select()
        .from(assignmentTable)
        .orderBy(desc(assignmentTable.createdAt))
        .limit(1)
    )[0];

    if (firstExpectedAssignment === undefined) {
      throw new Error(
        'No latest assignment was found even though the scheduler should have created one.',
      );
    }

    expect(firstExpectedAssignment.userId).toBe(firstUserId);
    expect(firstExpectedAssignment.createdAt).toStrictEqual(
      new Date('2024-09-29T22:00:00.000Z'),
    );

    jest.setSystemTime(new Date('2024-10-10 14:00:00Z'));
    await assignmentSchedulerService.handleCron();

    const secondExpectedAssignment = (
      await db
        .select()
        .from(assignmentTable)
        .orderBy(desc(assignmentTable.createdAt))
        .limit(1)
    )[0];

    if (secondExpectedAssignment === undefined) {
      throw new Error(
        'No latest assignment was found even though the scheduler should have created one.',
      );
    }

    expect(secondExpectedAssignment.userId).toBe(secondUserId);
    expect(secondExpectedAssignment.createdAt).toStrictEqual(
      new Date('2024-10-06T22:00:00.000Z'),
    );

    jest.setSystemTime(new Date('2024-10-17 14:00:00Z'));

    await assignmentSchedulerService.handleCron();

    const thirdExpectedAssignment = (
      await db
        .select()
        .from(assignmentTable)
        .orderBy(desc(assignmentTable.createdAt))
        .limit(1)
    )[0];

    if (thirdExpectedAssignment === undefined) {
      throw new Error(
        'No latest assignment was found even though the scheduler should have created one.',
      );
    }

    expect(thirdExpectedAssignment.userId).toBe(thirdUserId);
    expect(thirdExpectedAssignment.createdAt).toStrictEqual(
      new Date('2024-10-13T22:00:00.000Z'),
    );
  });
});
