import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey(),
  userName: text('user_name').unique(),
  email: text('email'),
});
