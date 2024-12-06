import {
  InsertTaskGroup,
  InsertTaskGroupUserMapping,
  InsertTask,
  InsertUser,
  InsertUserGroup,
  InsertUserUserGroupMapping,
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

export const taskGroupWeekly = {
  id: 1,
  initialStartDate: new Date('2024-07-28 22:00:00Z'),
  interval: '1 week',
  title: 'Every week',
  userGroupId: 1,
} satisfies InsertTaskGroup;

export const taskVacuuming = {
  id: 1,
  title: 'Staubsaugen',
  createdAt: new Date(),
  description: 'Boden saugen',
  taskGroupId: taskGroupWeekly.id,
} satisfies InsertTask;

export const mockUserValues = [userJakob, userJulian, userMustermann];
export const mockUserUserGroupValues = [
  {
    userGroupId: userGroupWG1.id,
    userId: userJulian.id,
  },
  { userGroupId: userGroupWG1.id, userId: userJakob.id },
  { userGroupId: userGroupWG1.id, userId: userMustermann.id },
] satisfies InsertUserUserGroupMapping[];

export const mockTaskGroupUserValues = [
  {
    taskGroupId: taskGroupWeekly.id,
    userId: userJulian.id,
    assignmentOrdinal: 0,
  },
  {
    taskGroupId: taskGroupWeekly.id,
    userId: userJakob.id,
    assignmentOrdinal: 1,
  },
  {
    taskGroupId: taskGroupWeekly.id,
    userId: userMustermann.id,
    assignmentOrdinal: 2,
  },
] satisfies InsertTaskGroupUserMapping[];
