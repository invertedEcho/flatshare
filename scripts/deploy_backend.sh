#!/bin/sh

git pull
cd backend/ || exit
pnpm i
pnpm build
pnpm start:prod
