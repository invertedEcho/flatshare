# unnamed

## setup

- Install all dependencies

```bash
pnpm i
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
pnpm app
```

alternatively, you can also start the frontend and backend individually:
```bash
pnpm app:frontend
pnpm app:backend
```

### The Stack:

- Root:
  - pnpm as package manager with workspaces feature

- Backend:
  - NestJS
  - drizzle

- Frontend:
  - React native
  - Tanstack usequery
