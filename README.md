# wg-app WIP

## setup

- Install all dependencies for backend

```bash
cd backend && pnpm i
```

- setup environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
adjust the values as needed.

- start the apps

```bash
cd backend && pnpm dev
cd frontend && flutter run
```

## The Stack:

- Backend:
  - NestJS
  - drizzle

- Frontend:
  - flutter
