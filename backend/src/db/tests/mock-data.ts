import {
  InsertRecurringTaskGroup,
  InsertTask,
  InsertUser,
  InsertUserGroup,
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
