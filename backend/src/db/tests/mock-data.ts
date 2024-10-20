import {
  InsertRecurringTaskGroup,
  InsertRecurringTaskGroupUser,
  InsertTask,
  InsertUser,
  InsertUserGroup,
  InsertUserUserGroup,
} from '../schema';

export const userJulian = {
  email: 'julian@test.de',
  password: '12345',
  username: 'Julian',
  id: 1,
} satisfies InsertUser;

export const userJakob = {
  email: 'jakob@test.de',
  password: '23456',
  username: 'Jakob',
  id: 2,
} satisfies InsertUser;

export const userMustermann = {
  email: 'mustermann@test.de',
  password: '34567',
  username: 'Mustermann',
  id: 3,
};

export const userGroupWG1 = {
  name: 'WG No. 1',
  id: 1,
} satisfies InsertUserGroup;

export const recurringTaskGroupWeekly = {
  id: 1,
  initialStartDate: new Date('2024-07-28 22:00:00Z'),
  interval: '1 week',
  title: 'Every week',
  userGroupId: 1,
} satisfies InsertRecurringTaskGroup;

export const taskVacuuming = {
  id: 1,
  title: 'Staubsaugen',
  createdAt: new Date(),
  description: 'Boden saugen',
  recurringTaskGroupId: recurringTaskGroupWeekly.id,
} satisfies InsertTask;

export const mockUserValues = [userJakob, userJulian, userMustermann];
export const mockUserUserGroupValues = [
  {
    groupId: userGroupWG1.id,
    userId: userJulian.id,
  },
  { groupId: userGroupWG1.id, userId: userJakob.id },
  { groupId: userGroupWG1.id, userId: userMustermann.id },
] satisfies InsertUserUserGroup[];

export const mockRecurringTaskGroupUserValues = [
  {
    recurringTaskGroupId: recurringTaskGroupWeekly.id,
    userId: userJulian.id,
    assignmentOrdinal: 0,
  },
  {
    recurringTaskGroupId: recurringTaskGroupWeekly.id,
    userId: userJakob.id,
    assignmentOrdinal: 1,
  },
  {
    recurringTaskGroupId: recurringTaskGroupWeekly.id,
    userId: userMustermann.id,
    assignmentOrdinal: 2,
  },
] satisfies InsertRecurringTaskGroupUser[];
