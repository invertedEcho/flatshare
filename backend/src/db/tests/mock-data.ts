import { InsertUser, InsertUserGroup } from '../schema';

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
