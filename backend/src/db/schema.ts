import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey(),
  userName: text('user_name').unique(),
  email: text('email'),
});

export const taskTable = pgTable('task', {
  id: uuid('id').primaryKey(),
  title: text('title'),
  description: text('description'),
});
export type SelectTask = typeof taskTable.$inferSelect;
export type InsertTask = typeof taskTable.$inferInsert;
