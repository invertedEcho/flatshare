import { sql } from 'drizzle-orm';
import {
  taskGroupTable,
  taskGroupUserMappingTable,
  taskTable,
  taskUserGroupMappingTable,
  userGroupTable,
  userTable,
  userUserGroupMappingTable,
} from '../schema';
import {
  mockTaskGroupUserValues,
  mockUserUserGroupValues,
  mockUserValues,
  taskGroupWeekly,
  taskVacuuming,
  userGroupWG1,
} from './mock-data';
import { db } from '..';

export async function truncateAllTables(): Promise<void> {
  const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

  const tables = await db.execute(query);

  for (const table of tables) {
    const query = sql.raw(`TRUNCATE TABLE public.${table.table_name} CASCADE;`);
    await db.execute(query);
  }
}

/**
 * Seeds the database with initial mock user data for testing or development purposes.
 *
 * - Creates a user group.
 * - Inserts two users (Julian, Jakob and Mustermann).
 * - Adds these users to the previously created user group.
 *
 * This function is intended to set up test data for scenarios involving user groups and their relationships.
 * It ensures that the database has basic data required for tests or initial state in a development environment.
 */
export async function seedDatabaseWithUserData() {
  await db.insert(userGroupTable).values(userGroupWG1);
  await db.insert(userTable).values(mockUserValues);
  await db.insert(userUserGroupMappingTable).values(mockUserUserGroupValues);
}

export async function seedDatabaseWithTaskData() {
  await db.insert(taskGroupTable).values(taskGroupWeekly);

  await db.insert(taskGroupUserMappingTable).values(mockTaskGroupUserValues);

  await db.insert(taskTable).values(taskVacuuming);
  await db
    .insert(taskUserGroupMappingTable)
    .values({ userGroupId: userGroupWG1.id, taskId: taskVacuuming.id });
}
