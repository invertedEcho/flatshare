import { drizzle } from 'drizzle-orm/postgres-js';
import 'dotenv/config';
import * as postgres from 'postgres';

// TODO: Switch to t3-oss/env
const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error('DATABASE_URL is undefined');
}

const client = postgres(connectionString);

export const db = drizzle(client);

// TODO: Switch to t3-oss/env
export const testingConnectionString = process.env.TESTING_DATABASE_URL;

if (testingConnectionString === undefined) {
  throw new Error('TESTING_DATABASE_URL is undefined');
}

const testingClient = postgres(testingConnectionString);

export const testingDb = drizzle(testingClient);
