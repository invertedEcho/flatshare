import { drizzle } from 'drizzle-orm/postgres-js';
import 'dotenv/config';
import * as postgres from 'postgres';

// TODO: Switch to t3-oss/env
const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error('DATABASE_URL is undefined');
}
console.log({ connectionString });
const client = postgres(connectionString);
console.log({ client });

export const db = drizzle(client);
