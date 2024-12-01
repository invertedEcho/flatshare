import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error(
    'DATABASE_URL is undefined. Did you correctly setup a .env file?',
  );
}

export const client = postgres(connectionString);

export const db = drizzle(client);
