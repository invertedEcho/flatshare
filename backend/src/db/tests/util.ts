import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { testingDb } from '..';
import { userGroupTable, userTable, userUserGroupTable } from '../schema';
import { userGroupWG1, userJakob, userJulian } from './mock-data';

export async function clearDb(db: PostgresJsDatabase): Promise<void> {
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

export async function seedDatabase() {
  await testingDb.insert(userGroupTable).values(userGroupWG1);
  await testingDb.insert(userTable).values([userJulian, userJakob]);
  await testingDb.insert(userUserGroupTable).values({
    groupId: userGroupWG1.id,
    userId: userJulian.id,
  });
}
