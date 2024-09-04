import { client, db } from 'src/db';
import {
  assignmentTable,
  InsertRecurringTaskGroup,
  recurringTaskGroupTable,
  recurringTaskGroupUserTable,
  taskTable,
  taskUserGroupTable,
} from 'src/db/schema';
import {
  taskVacuuming,
  userGroupWG1,
  userJulian,
} from 'src/db/tests/mock-data';
import { seedDatabaseWithUserData, truncateAllTables } from 'src/db/tests/util';
import { AssignmentSchedulerService } from './assignment-scheduler.service';

describe('Assignment scheduler', () => {
  const mockService = new AssignmentSchedulerService();

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
    jest.useRealTimers(); // Clean up to avoid side effects in other tests
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
    });

    // Create new Task
    await db.insert(taskTable).values(taskVacuuming);
    await db
      .insert(taskUserGroupTable)
      .values({ groupId: userGroupWG1.id, taskId: taskVacuuming.id });

    jest.setSystemTime(new Date('2024-09-03 22:00:00Z'));
    // Run scheduler function ad Wednesday in week 2
    await mockService.handleCron();

    // check that assignment with created at of Monday in week 2 exists
    const assignments = await db.select().from(assignmentTable);
    expect(assignments).toHaveLength(1);
    expect(assignments[0]?.createdAt).toStrictEqual(
      new Date('2024-09-01 22:00:00Z'),
    );
    console.debug({ assignments });
  });
});
