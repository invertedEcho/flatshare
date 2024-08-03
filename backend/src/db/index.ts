import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';

// TODO: Switch to t3-oss/env
const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error('DATABASE_URL is undefined');
}

const client = postgres(connectionString);

export const db = drizzle(client);
