import type { Config } from 'drizzle-kit';

// TODO: Replace with t3-oss/env
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl === undefined) {
  throw new Error('env: DATABASE_URL undefined');
}

const config = {
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: 'postgresql',
} satisfies Config;

export default config;
