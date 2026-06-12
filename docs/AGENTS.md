# Tourisme (Eco-Voyage)

## Structure

Two independent packages under `backend/` and `frontend/`. No monorepo tooling. No shared code. No CI/CD.

| Package | What | Scripts |
|---|---|---|
| `backend/` | NestJS 11 API (TypeORM + PostgreSQL, Mongoose + MongoDB) | `yarn start:dev`, `yarn build`, `yarn test`, `yarn lint`, `yarn format` (Prettier) |
| `frontend/` | Next.js 16 SPA (React 19, Tailwind v4) | `yarn dev`, `yarn build`, `yarn lint` |

Both use **Yarn** (not npm). No test framework in frontend.

## Commands

- Backend test (unit): `yarn test` (jest, `*.spec.ts` in `src/`)
- Backend test (e2e): `yarn test:e2e` (jest config `test/jest-e2e.json`, `*.e2e-spec.ts`)
- Backend lint: `yarn lint` (ESLint flat config — `no-explicit-any: off`, `no-floating-promises: warn`)
- Backend format: `yarn format` (Prettier — `singleQuote: true`, `trailingComma: "all"`)
- Backend seeds: `yarn seed:eco-traveler-questionnaire`, `yarn seed:guide-questionnaire`, `yarn seed:project-questionnaire`
- Frontend lint: `yarn lint` (ESLint — `eslint-config-next/core-web-vitals`)
- Dev: `yarn start:dev` in `backend/`, `yarn dev` in `frontend/`

## Docker

5 services orchestrated by `docker-compose.yml`: db (PostgreSQL 15), mongo (MongoDB 7), minio (S3-compatible storage), api, web.
External network `tourisme_net` must be created before `docker compose up`:
```
docker network create tourisme_net
```
To run only MinIO: `docker compose up -d minio` (ports 9000 API, 9001 Console).
Backend Dockerfile: multi-stage, node:20-alpine, `yarn install --frozen-lockfile`.
Frontend Dockerfile: multi-stage, node:20-alpine, `output: "standalone"`, needs `NEXT_PUBLIC_API_URL` build arg.

## Config

- Dev env: `backend/.env`, Prod env: `backend/.env.production`
- No `.env` in frontend; API URL is a build arg (`NEXT_PUBLIC_API_URL`) or hardcoded in `lib/api.ts`
- `synchronize: true` in TypeORM — drops/recreates schema on every dev start
- `noImplicitAny: false` in backend `tsconfig.json` — explicit `any` is fine
- `FRONTEND_URL` must match the frontend dev server for OAuth redirects

## Frontend particulars

- `@/*` maps to `frontend/` root (e.g. `@/lib/api`)
- Material You design, 100% French UI
- No state library — uses `localStorage` + manual `apiFetch` (auto-refresh token rotation in `lib/api.ts`)
- Next.js 16 has breaking changes from prior versions; **read `node_modules/next/dist/docs/` before writing code**
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin and `@theme` directive

## Caveats

- Secrets committed to repo (SMTP creds, Google OAuth, JWT secret in `.env` files)
- No tests in frontend
- No formatter config in frontend
- `synchronize: true` is dev-only — unsafe for production
