# wg-app WIP

## User flow
https://excalidraw.com/#room=2a90cf068f4d87bce613,24I3dxykUBivS35QOdgTqw

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
