# CricClubs data layer (Phase 0/1)

A local Postgres mirror of the CricClubs data Club Cricket of Chicago needs, synced on
a schedule. The website reads from this DB instead of re-entering data in the CMS.
Full rationale and roadmap: see [`../REBUILD_PLAN.md`](../REBUILD_PLAN.md).

## What's here

```
prisma/schema.prisma          DB schema (series, teams, players, rosters, fixtures,
                              matches, standings, batting/bowling/fielding stats, sync_state)
app/lib/cricclubs/            CricClubs API client
  config.ts                   clubId 63, tracked series, CCC team IDs, env wiring
  client.ts                   fetch wrapper (auth headers, envelope check, retry)
  endpoints.ts                typed endpoint functions
  types.ts                    raw API response shapes
app/lib/db/prisma.ts          PrismaClient singleton
app/lib/sync/index.ts         endpoint -> upsert mappers + syncAll() orchestrator
app/api/sync/route.ts         GET /api/sync (Bearer CRON_SECRET) -> runs syncAll
scripts/sync.ts               `npm run sync` (CLI/cron)
scripts/cricclubs-smoke.ts    `npm run cricclubs:smoke` (API check, no DB)
```

## Scope

- **clubId 63** (Midwest Cricket Conference). The `association` param is ignored by the API.
- **Tracked series** (`app/lib/cricclubs/config.ts`): Summer 2026 divisions CCC plays in
  (361 Master Royal RedBall Premier, 362 Blast T20, 364 RedBall Division II) plus the
  2024/2025 tournaments already on the site (300, 312, 330, 331, 333). The site keys each
  tournament by `seriesId` (its slug == seriesId), so this maps 1:1 with current content.
- **CCC squads**: team IDs 2677 / 2686 / 2714 (one per 2026 division).

## Setup & run

```bash
# 1. Install (postinstall runs `prisma generate`)
npm install

# 2. Configure env
cp .env.example .env          # then fill X_CONSUMER_KEY / X_API_KEY and DATABASE_URL

# 3. Verify API access (no DB needed)
npm run cricclubs:smoke

# 4. Create the schema in your DB
npm run db:push               # or: npm run db:migrate  (creates a migration)

# 5. Sync CricClubs -> DB (idempotent; safe to re-run)
npm run sync
```

### Quick local Postgres (Docker)

```bash
docker run -d --name ccc-pg -e POSTGRES_USER=ccc -e POSTGRES_PASSWORD=ccc \
  -e POSTGRES_DB=ccc -p 5432:5432 postgres:16
# DATABASE_URL="postgresql://ccc:ccc@localhost:5432/ccc"
```

## Sync via HTTP (for cron)

```
GET /api/sync
Authorization: Bearer ${CRON_SECRET}
```

Suggested cadence (e.g. Vercel Cron hitting `/api/sync`, or system cron hitting `npm run sync`):
results/standings/stats frequently on match days, schedule/series/rosters daily. The sync
records per-entity status in the `sync_state` table; one failing step never aborts the rest.

## Field coverage

Every competitive field the site shows resolves from CricClubs — standings
(`/team/getPointsTable`), the Number Zone stat tables (`/stats/get{Batting,Bowling,Feilding}Stats`),
fixtures, results, rosters. See REBUILD_PLAN §12 for the field-by-field map. Editorial
content (hero, sponsors, management, academy, player gold/silver/bronze tier) stays in the CMS.

## Not in this phase

- Wiring the pages to read from the DB (Phase 4) — the existing CMS-driven pages are untouched.
- Player career stats caching (`/player/getStats` still served live by `/api/player-stats`).
- The 3 auth-gated endpoints (series details/numbers/rankings) — not required; rankings are
  derivable by joining the `points` field across the three stat tables.
