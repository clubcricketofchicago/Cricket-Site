# Deployment

The site is a Next.js 16 app backed by **Neon Postgres** (a mirror of CricClubs data)
plus **Craft CMS** for editorial content. Merging to `main` only ships the code — the
steps below must be done **on the hosting environment** before it serves real data.

## 1. Environment variables
Set every variable from [`.env.example`](.env.example) on the host (none are committed):

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
Schedule `GET /api/sync` (same Bearer auth) on a recurring interval — Vercel Cron, a
platform scheduler, or an external cron hitting the URL.

## Notes
- **Neon auto-suspends when idle**, so the first request after a quiet period is a slow
  cold start (not a bug). A keep-warm ping or an always-on Neon plan avoids it.
- `GET /api/sync` can run long (`maxDuration = 300`); ensure the host allows it
  (e.g. Vercel Pro for >10s functions).
- Editorial content (home blocks, sponsors, nav) still comes from the **Craft CMS**
  GraphQL endpoint — it must be reachable and populated in production.
- Remote image hosts are whitelisted in `next.config.ts` (`media.cricclubs.com`,
  `cricclubs.com`, the CMS host); most images render `unoptimized` so they work regardless.
