# Flatshare

This mobile app allows you to easily track all what you need in your shared apartment with ease and no useless features.

## Installing

- IOS: https://testflight.apple.com/join/evmP9jag
- Android: Install the latest apk from the [release](https://github.com/invertedEcho/flatshare/releases) tab

## dev setup

- Install all dependencies for backend

```bash
cd backend && pnpm i
```

- setup environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# adjust the values as needed.
```

- setup database

```bash
# you will of course have to install docker beforehand
docker compose up -d
```

- start the apps

```bash
cd backend && pnpm dev
cd frontend && flutter run
```

## tests

the tests are currently mainly focused around the database functions used in the assignment scheduler.

as you probably dont want to run the tests against your main database, the tests are setup to run via a different .env file, e.g. `.env.test`

- setup .env.test:

  ```bash
  touch .env.test

  # content 
  DB_PASSWORD=postgres://***
  ```

- run the tests:

  ```bash
  pnpm test
  # or pnpm test:watch for "hot-reloaded" tests
  ```

## The Stack:

- Backend:
  - NestJS
  - drizzle (ORM)

- Frontend:
  - flutter
