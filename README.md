# wg-app WIP

## setup

- Install all dependencies

```bash
cd backend && pnpm i
cd frontend && pnpm i
```

- setup environment variables

```bash
touch frontend/.env

# file content
EXPO_PUBLIC_API_URL=http://localhost:3000

touch backend/.env

# file content
DATABASE_URL=****
```

## start the apps

```bash
cd backend && pnpm dev
cd frontend && pnpm start
```

### The Stack:

- Backend:

  - NestJS
  - drizzle

- Frontend:
  - React native
  - Tanstack usequery

### TODO

- Use pnpm workspaces to manage each project more efficient

## Task grouping

The user flow should be the following

- user creates a group
- user creates tasks
- user can add tasks to a specific group
- a group can have multiple tasks, a frequency, and users that can be assigned to the tasks from that group
- all tasks in the group will be assigned to the same user in one period

This means we will remove the frequency column from the task table and add it to the task_group table.
