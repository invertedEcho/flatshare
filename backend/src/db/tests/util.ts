import { sql } from 'drizzle-orm';
import { userGroupTable, userTable, userUserGroupTable } from '../schema';
import { userGroupWG1, userJakob, userJulian } from './mock-data';
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

export async function seedDatabase() {
  await db.insert(userGroupTable).values(userGroupWG1);
  await db.insert(userTable).values([userJulian, userJakob]);
  await db.insert(userUserGroupTable).values({
    groupId: userGroupWG1.id,
    userId: userJulian.id,
  });
}
