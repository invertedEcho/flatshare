import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl === undefined) {
  throw new Error('env: DATABASE_URL undefined');
}

const databaseConnection = drizzle(
  postgres(databaseUrl, { ssl: 'prefer', max: 1 }),
);

const main = async () => {
  try {
    await migrate(databaseConnection, {
      migrationsFolder: './src/db/migrations',
    });
    console.log('Migration complete');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};

/* eslint-disable @typescript-eslint/no-empty-function */
main()
  .then(() => {})
  .catch(() => {});
