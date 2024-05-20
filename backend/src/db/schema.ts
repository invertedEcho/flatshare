import {
  integer,
  interval,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const assignmenState = z.enum(['pending', 'completed']);
export const assigmentStateEnum = pgEnum('state', assignmenState.options);
export type AssignmentState = z.infer<typeof assignmenState>;

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const taskTable = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  taskGroupId: integer('task_group_id').references(() => taskGroupTable.id),
});

export const taskGroupTable = pgTable('task_group', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  interval: interval('interval').notNull(),
  initialStartDate: timestamp('initial_start_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const taskGroupAssignmentTable = pgTable('task_group_assignment_table', {
  id: serial('id').primaryKey(),
  taskGroupId: integer('task_group_id')
    .references(() => taskGroupTable.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => userTable.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const taskGroupUserTable = pgTable('task_group_user', {
  id: serial('id').primaryKey(),
  taskGroupId: integer('task_group_id')
    .references(() => taskGroupTable.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => userTable.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const assignmentTable = pgTable('assignment', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id')
    .references(() => taskTable.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => userTable.id)
    .notNull(),
  state: assigmentStateEnum('state').default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type SelectTask = typeof taskTable.$inferSelect;
export type InsertTask = typeof taskTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;
