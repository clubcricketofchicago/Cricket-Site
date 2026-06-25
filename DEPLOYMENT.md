# Deployment

The site is a Next.js 16 app backed by **Neon Postgres** (a mirror of CricClubs data)
plus **Craft CMS** for editorial content. Merging to `main` only ships the code — the
steps below must be done **on the hosting environment** before it serves real data.

## 1. Environment variables
Set every variable from [`.env.example`](.env.example) on the host (none are committed).
On Vercel: **Project Settings → Environment Variables** (Production scope).

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** endpoint (`-pooler` host) — app runtime |
| `DIRECT_URL` | Neon **direct** endpoint — schema push / sync |
| `X_API_KEY`, `X_CONSUMER_KEY` | CricClubs core API keys |
| `CRON_SECRET` | shared secret guarding `GET /api/sync` |
| `NEXT_PUBLIC_CMS_URL` | Craft CMS base URL (`https://cms.ccc.clubcricketofchicago.com/`) |

## 2. Database schema
There are no migration files — apply the Prisma schema directly (uses `DIRECT_URL`):

```bash
npx prisma db push
```

## 3. Build & run

```bash
npm ci && npm run build   # postinstall runs `prisma generate`
npm run start             # or the platform's managed Next.js runtime
```

## 4. First data load — REQUIRED
After step 2 the DB is **empty**, so pages render empty states until a sync runs:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/sync
```

## 5. Keep data fresh (cron)
[`vercel.json`](vercel.json) registers a **Vercel Cron** that calls `GET /api/sync` every
6 hours (`0 */6 * * *`). Vercel automatically attaches `Authorization: Bearer $CRON_SECRET`
to cron requests, so once `CRON_SECRET` is set (step 1) the endpoint is authenticated with
no extra wiring. Adjust the schedule in `vercel.json` to taste.

> **Needs the Vercel Pro plan.** The full sync runs longer than Hobby's 60s function limit
> (`/api/sync` sets `maxDuration = 300`) and sub-daily crons are Pro-only. On Hobby the sync
> would be cut off mid-run — instead run `npm run sync` from an external scheduler against
> the same `DATABASE_URL` / `DIRECT_URL`.

## Notes
- **Neon auto-suspends when idle**, so the first request after a quiet period is a slow
  cold start (not a bug). A keep-warm ping or an always-on Neon plan avoids it.
- `GET /api/sync` can run long (`maxDuration = 300`); ensure the host allows it
  (e.g. Vercel Pro for >10s functions).
- Editorial content (home blocks, sponsors, nav) still comes from the **Craft CMS**
  GraphQL endpoint — it must be reachable and populated in production.
- Remote image hosts are whitelisted in `next.config.ts` (`media.cricclubs.com`,
  `cricclubs.com`, the CMS host); most images render `unoptimized` so they work regardless.
