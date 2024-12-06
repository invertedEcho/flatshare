import {
  integer,
  interval,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

const assignmentState = z.enum(['pending', 'completed']);
export const assignmentStateEnum = pgEnum(
  'assignment_state',
  assignmentState.options,
);
export type AssignmentState = z.infer<typeof assignmentState>;

export const shoppingListItemState = z.enum([
  'pending',
  'purchased',
  'deleted',
]);
export const shoppingListItemStateEnum = pgEnum(
  'shopping_list_item_state',
  shoppingListItemState.options,
);
export type ShoppingListItemState = z.infer<typeof shoppingListItemState>;

/**
 * This table stores information about all users.
 */
export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

/**
 * This table stores information about a group of users
 */
export const userGroupTable = pgTable('user_group', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectUserGroup = typeof userGroupTable.$inferSelect;
export type InsertUserGroup = typeof userGroupTable.$inferInsert;

/**
 * This table stores invite codes of a specific group.
 */
export const userGroupInviteTable = pgTable('user_group_invite', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  userGroupId: integer('user_group_id')
    .references(() => userGroupTable.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectUserGroupInvite = typeof userGroupInviteTable.$inferSelect;
export type InsertUserGroupInvite = typeof userGroupInviteTable.$inferInsert;

/**
 * This association table stores information about which user belong into which groups,
 * in a N-N relation, e.g. a user may be in multiple groups.
 */
export const userUserGroupMappingTable = pgTable(
  'user_user_group_mapping',
  {
    userId: integer('user_id')
      .references(() => userTable.id)
      .notNull(),
    userGroupId: integer('user_group_id')
      .references(() => userGroupTable.id)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.userGroupId] }),
    };
  },
);
export type SelectUserUserGroupMapping =
  typeof userUserGroupMappingTable.$inferSelect;
export type InsertUserUserGroupMapping =
  typeof userUserGroupMappingTable.$inferInsert;

/**
 * This table stores all tasks that exist in the application. Note that these are merely "blueprints"
 * that describe a task that needs to be completed, and are to be used with assignments.
 */
export const taskTable = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  // FIXME: This should not be here -> association table, so a task can be in multiple task groups
  taskGroupId: integer('task_group_id').references(() => taskGroupTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectTask = typeof taskTable.$inferSelect;
export type InsertTask = typeof taskTable.$inferInsert;

/**
 * This table stores information about a collection of tasks. Each interval, an algorithm determines which user's turn it is.
 */
export const taskGroupTable = pgTable('task_group', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  interval: interval('interval').notNull(),
  initialStartDate: timestamp('initial_start_date', {
    mode: 'date',
  }).notNull(),
  userGroupId: integer('user_group_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectTaskGroup = typeof taskGroupTable.$inferSelect;
export type InsertTaskGroup = typeof taskGroupTable.$inferInsert;

/**
 * This table stores information about the users that belong to a task group
 */
export const taskGroupUserMappingTable = pgTable(
  'task_group_user_mapping',
  {
    taskGroupId: integer('task_group_id')
      .references(() => taskGroupTable.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => userTable.id)
      .notNull(),
    // The user with the lowest ordinal will be the first one to get assigned assignments from this task group
    assignmentOrdinal: integer('assignment_ordinal').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.taskGroupId, table.userId, table.assignmentOrdinal],
      }),
    };
  },
);
export type SelectTaskGroupUserMapping =
  typeof taskGroupUserMappingTable.$inferSelect;
export type InsertTaskGroupUserMapping =
  typeof taskGroupUserMappingTable.$inferInsert;

/**
 * This table stores information about tasks that need to be completed by a specific user
 */
export const assignmentTable = pgTable('assignment', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id')
    .references(() => taskTable.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => userTable.id)
    .notNull(),
  state: assignmentStateEnum('state').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectAssignment = typeof assignmentTable.$inferSelect;
export type InsertAssignment = typeof assignmentTable.$inferInsert;

/**
 * This table stores information about which tasks belong to an user group.
 */
export const taskUserGroupMappingTable = pgTable('task_user_group_mapping', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id')
    .references(() => taskTable.id)
    .notNull(),
  userGroupId: integer('user_group_id')
    .references(() => userGroupTable.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type SelectTaskUserGroupMapping =
  typeof taskUserGroupMappingTable.$inferSelect;
export type InsertTaskUserGroupMapping =
  typeof taskUserGroupMappingTable.$inferInsert;

/**
 * This table stores information about shopping list items that belong to an user group.
 */
export const shoppingListItemTable = pgTable('shopping_list_item', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  userGroupId: integer('user_group_id')
    .references(() => userGroupTable.id)
    .notNull(),
  state: shoppingListItemStateEnum('state').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
