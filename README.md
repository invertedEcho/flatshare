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
