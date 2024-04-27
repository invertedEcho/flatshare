import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username').notNull(),
});

export const taskTable = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
});

export const assignmentTable = pgTable('assignment', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id')
    .references(() => taskTable.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => userTable.id)
    .notNull(),
});

export const assignmentCompletionTable = pgTable('assignment_completion', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => assignmentTable.id),
});

export type SelectTask = typeof taskTable.$inferSelect;
export type InsertTask = typeof taskTable.$inferInsert;
