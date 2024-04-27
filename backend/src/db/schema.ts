import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email'),
});

export const taskTable = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title'),
  description: text('title'),
});

export type SelectTask = typeof taskTable.$inferSelect;
export type InsertTask = typeof taskTable.$inferInsert;
