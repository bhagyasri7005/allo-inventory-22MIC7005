Update README with deployment, migration, and run instructions.

Allo Inventory — README

Overview
-
This project is a small Next.js (App Router) demo that implements an inventory reservation flow (reserve → confirm → release) across warehouses. It includes API routes and a minimal frontend.

What this README covers
- How to run locally
- Environment variables required
- Migrations and seed process
- How expiry works in production
- Trade-offs and missing pieces

Run locally
- Create a `.env` file in the project root with at least:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NODE_ENV=development
```

- Install deps and generate Prisma client (the repo runs `prisma generate` postinstall):

```bash
npm install
npm run dev
```

- Open http://localhost:3000 and interact with the inventory list and reservation flows.

Prisma migrations & seeding
- This repo contains `prisma/schema.prisma`. For production you should run migrations against your hosted Postgres (Supabase/Neon/Railway).

- To apply migrations (recommended to run from CI or a safe admin machine):

```bash
# set DATABASE_URL in your shell environment
npx prisma migrate deploy
```

- The project includes an HTTP seed endpoint at `/api/seed` which inserts sample warehouses, products, and inventory. After deploying and applying migrations, trigger the seed route once:

```bash
curl https://<your-app>.vercel.app/api/seed
```

Vercel deployment notes
- Import the GitHub repo into Vercel (Dashboard → New Project → Import from GitHub).
- Add environment variables in Vercel Project Settings → Environment Variables:
	- `DATABASE_URL` — your hosted Postgres URL
	- (Optional) `NODE_ENV=production`
- Ensure the Build Command runs migrations or generates Prisma client. This repo includes a `postinstall` script that runs `prisma generate` automatically during `npm install`. For migrations, either:
	- Run migrations outside Vercel (recommended), or
	- Add `npx prisma migrate deploy && npm run build` as the Build Command.

Common build failure (Prisma schema)
- If `prisma generate` fails during install on Vercel, ensure `prisma/schema.prisma` is valid (it must define `datasource`/`generator` in your real setup) and `DATABASE_URL` is not required for generation but migrations do need a DB.

Reservation expiry & cleanup
- Reservations have an `expiresAt` timestamp (default 10 minutes after creation).
- Confirm endpoint (`POST /api/reservations/:id/confirm`) returns `410` if the reservation has expired.
- Automatic release of expired reservations is not implemented as a background worker in this repo. Recommended production approaches:
	- Vercel Cron (Scheduled Serverless Function) that runs every minute and releases expired reservations by decrementing reservedStock and updating reservation status to `RELEASED`.
	- A small background worker (e.g., on Fly, Heroku, or a container) that polls the DB or subscribes to a job queue.
	- Lazy cleanup: when reading inventory or attempting confirm/release, detect expired reservations and release them on the fly.

Idempotency (bonus)
- Not implemented fully in this repo. For production idempotency you can:
	- Accept an `Idempotency-Key` header on state-changing endpoints and store request results in Redis keyed by that header.
	- On retries with the same key, return the stored response instead of repeating side effects.

Trade-offs & notes
- Concurrency: the current implementation relies on Prisma updates but does not include explicit DB row-level locking or conditional updates to guarantee uniqueness under extreme concurrency. For strict guarantees use a DB transaction with a `SELECT ... FOR UPDATE` lock or an atomic `UPDATE ... WHERE reservedStock + quantity <= totalStock` pattern.
- Hosted DB requirement: this project expects a hosted Postgres instance (Supabase/Neon/Railway) for production; SQLite/local DBs are fine for development but don't reflect production behavior.
- The frontend is minimal; the reservation page shows details but does not include a live countdown UI in this iteration.

If you want, I can add a scheduled Vercel function example and migrate scripts to this repo next.

License / contact
- This is a take-home demo. For questions contact the author via the connected GitHub account.

