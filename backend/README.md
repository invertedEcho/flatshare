## backend setup

- Install all dependencies for backend

```bash
pnpm i
```

- start local docker database (or use a free one like [Supabase](https://supabase.com))

```bash
# you will of course have to install docker beforehand
docker compose up -d
```

- setup environment variables

```bash
# adjust the values as needed.
cp .env.example .env
```

- start the apps

```bash
pnpm dev
```

## production setup

- setup environment variables

```bash
# adjust the values as needed.
cp .env.example .env
```

- ensure docker is installed

```bash
docker build . -t flatshare-backend
docker run -d --publish 3000:3000 --restart always flatshare-backend
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
