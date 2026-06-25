# CLAUDE.md — Cricket-Site

Guidance for AI agents working in this repository. Read this before editing.

## What this is

The **public-facing website for "Club Cricket of Chicago" (CCC)** — a competitive
cricket club in Chicago. Live at **https://www.clubcricketofchicago.com**. It presents
the club to fans and prospective players: a home **season hub**, match
**schedule/calendar**, **tournaments** (standings + stat tables), a **players** roster
and per-player **profiles**, **match scorecards**, a **grounds** gallery, a **CCC
Academy** page, and a **join-us** recruitment form. It is a content/marketing site, not
an admin or live-scoring tool. Package name is `ccc`; repo
`github.com/clubcricketofchicago/Cricket-Site`.

## Data sources — a CricClubs→Postgres + CMS HYBRID (important)

> Historical note: the site originally read everything from Craft CMS with **no
> database**. That is no longer true. Competitive data now comes from **CricClubs
> mirrored into Neon Postgres**; the CMS is now editorial-only.

1. **CricClubs → Neon Postgres — the competitive-data backbone.**
   - Typed CricClubs client in `app/lib/cricclubs/*` (`client.ts` fetch+retry,
     `endpoints.ts` typed wrappers, `config.ts` = clubId 63 = MWCC + `TRACKED_SERIES`).
   - **Sync** (`app/lib/sync/index.ts`) maps CricClubs into **Prisma** upserts / bulk
     `deleteMany+createMany` snapshot-replaces in **Neon Postgres**. Trigger via
     `GET /api/sync` (cron, `CRON_SECRET`) or `npm run sync` (CLI, `scripts/sync.ts`).
   - **Server-side readers** in `app/lib/data/*` shape DB rows into the exact payloads
     the components already expect, cached with `unstable_cache` (tag `"cricclubs"`,
     busted on sync via `revalidateTag("cricclubs", "max")`).
   - Powers: home season hub, schedule/calendar, players roster, tournaments
     (list/year/detail), match scorecards, player profiles, recent results.
   - Prisma schema (`prisma/schema.prisma`): `Series, Team, Player, TeamRoster, Fixture,
     Match, Standing, PlayerBattingStat/BowlingStat/FieldingStat, SyncState`. Keyed by
     CricClubs natural IDs so every sync is idempotent. **No enforced FKs** (read-mostly
     mirror). **No migration files** — schema applied via `prisma db push`.

2. **Craft CMS via GraphQL — editorial content only.** Home-page Matrix blocks
   (hero/sponsors/"meet the management"/banners), navigation, grounds, academy.
   - Client: `app/lib/graphqlClient.js` → `POST https://cms.ccc.clubcricketofchicago.com/api`;
     query builders in `app/lib/queries/*` (no Apollo/urql).
   - Image base URL from `process.env.NEXT_PUBLIC_CMS_URL`.

3. **CricClubs live — one proxy route.** `app/api/player-stats/route.ts` proxies live
   career stats (`/player/getStats`), forwarding `X_API_KEY`/`X_CONSUMER_KEY`,
   `cache:"no-store"`. Used by the player **profile** page.

### Rendering pattern
Pages are still **Client Components** (`'use client'`, `dynamic = 'force-dynamic'`) that
fetch from internal **`/api/*` routes** in `useEffect`. Those API routes call the
**server-side, cached** `app/lib/data/*` readers (which hit Neon). So: client fetch →
server API route → cached DB read. Not full SSR, but the data layer + caching are
server-side. Editorial still comes straight from the CMS client-side.

## Tech stack

- **Next.js `^16`** (App Router, Turbopack), **React `^19`**, **TypeScript `^5`**
  (`strict`) — mixed `.js`/`.jsx` and `.ts`/`.tsx`.
- **Prisma `^6` + Neon Postgres** (the data mirror). `@prisma/client`; `postinstall`
  runs `prisma generate`.
- **Tailwind CSS `^3`** + a large hand-written `app/globals.css` (~4,600 lines) that is
  a **tokenized design system** — the "Blue Hour / Chicago Dusk" theme with **light +
  dark mode** (`data-theme` on `<html>`, sun/moon toggle in `ThemeToggle.tsx`). Fonts:
  **Saira Condensed** (display) + **Archivo** (body), self-hosted via `next/font` mapped
  onto the legacy var names so old classes re-skin.
- **framer-motion**, **swiper**, **react-tabs**, **date-fns**, **swup** +
  `next-page-transitions`, **emailjs-com** (join-us).
- ESLint 9 flat config (`eslint.config.mjs`). **No test framework.**
- **shadcn/ui** scaffolded but `src/` is unused (see below).

## Layout — `app/` is live, `src/` is dead

```
app/
  layout.tsx            ← root layout ('use client'); Header + Footer; theme no-flash script
  page.js               ← "/" home (CMS blocks by typeHandle + DB season hub/fixtures/results)
  globals.css           ← ~4,600 lines (tokenized "Blue Hour / Chicago Dusk" + light/dark)
  api/                  ← route handlers (see below)
  ccc-academy/ grounds/ join-us/ players/ schedule/ tournaments/ match/   ← pages
  players/[playerId]/   ← player profile page
  components/  ui/ calendar/ tournaments/ skeletons/    ← in-use components
  lib/
    cricclubs/          ← typed CricClubs API client (client/endpoints/config/types)
    sync/               ← CricClubs → Postgres sync orchestrator
    data/               ← server-side DB readers (cached, "cricclubs" tag) + ccc.ts identity helpers
    db/prisma.ts        ← Prisma client singleton
    graphqlClient.js + queries/   ← Craft CMS (editorial)
  data/{data.json,grounds.json}   ← static fallbacks
prisma/schema.prisma    ← the DB schema (no migrations; db push)
scripts/sync.ts         ← `npm run sync` CLI;  scripts/sync-cron.sh ← VPS cron wrapper
deploy/                 ← VPS self-host templates (systemd/nginx/deploy.sh) — alt to Vercel
src/                    ← DEAD shadcn scaffolding (imported nowhere; `@/*` alias unused)
```

## Routes + API

Pages: `/`, `/ccc-academy`, `/schedule`, `/players`, `/players/[playerId]`, `/grounds`,
`/join-us`, `/tournaments`, `/tournaments/[year]`, `/tournaments/[year]/[slug]`,
`/match/[matchId]`. Purely App Router.

API (all `runtime = "nodejs"`): `/api/players`, `/api/schedule`, `/api/recent-results`,
`/api/home`, `/api/tournaments` (`?view=list` = cheap config-only list; `?year=YYYY` =
one season's full details), `/api/tournaments/fixtures`, `/api/match/[matchId]`,
`/api/player/[playerId]`, `/api/player-stats` (live CricClubs proxy), `/api/sync`
(`Authorization: Bearer $CRON_SECRET`, runs the full sync).

## Environment variables (see `.env.example`, committed; `.env` is gitignored)

`DATABASE_URL` (Neon pooled), `DIRECT_URL` (Neon direct — migrations/sync), `X_API_KEY` +
`X_CONSUMER_KEY` (CricClubs), `CRON_SECRET` (guards `/api/sync`), `NEXT_PUBLIC_CMS_URL`
(Craft CMS). Optional `CRICCLUBS_*` have defaults in `config.ts`.

## Commands

`npm run dev` / `build` / `start`; `npm run lint` → **`eslint app`** (NOT `next lint` —
removed in Next 16); `npm run sync` (CricClubs→DB); `npm run db:push` / `db:studio` /
`db:generate`; `npm run cricclubs:smoke`.

## Deployment

Production runs on **Vercel under the club's own account** (team `ccc-2022`, project
`cricket-site`), **GitHub-connected** to this repo → push to `main` auto-deploys. Custom
domain `clubcricketofchicago.com` (apex + www) is on this project; DNS is at **Hostinger**
(nameservers `*.dns-parking.com`). Env vars live in **Vercel → Production**. On the Hobby
plan there is no usable Vercel cron, so the **data sync runs off-Vercel** (a GitHub Action
or the VPS cron in `scripts/sync-cron.sh`). Full runbook in **`DEPLOYMENT.md`**; data-layer
internals in **`docs/DATA_LAYER.md`**.

## Gotchas / things to know before editing

- **`src/` is dead code** — put components in `app/components/`; the `@/*` alias is unused.
- **Neon auto-suspends when idle** → the first request after a quiet period is a slow cold
  start (not a bug). Pages whose `/api/*` calls fail render empty/loading states.
- **`unstable_cache` busting:** in dev it needs a **dev-server restart** (clearing
  `.next/cache` alone is insufficient); in prod, `/api/sync` calls
  `revalidateTag("cricclubs", "max")` (Next 16 requires the 2nd arg).
- **`next.config.ts` is the single config** (the old `next.config.js` was removed). Image
  `remotePatterns`: `media.cricclubs.com`, `cricclubs.com`, the CMS host; most images use
  `unoptimized`.
- **Hardcoded EmailJS credentials** still live in `join-us/page.tsx`.
- Data is still client-fetched per page (the DB reads behind `/api/*` are cached
  server-side, but initial paint is client-side; not SSR/SSG).
- **CCC plays under variant team names** in some seasons ("…Seekers", "CCC Stars") —
  identify CCC by name OR `CCC_ALT_TEAM_IDS` via the helpers in `app/lib/data/ccc.ts`.
  Show RAW CricClubs values; don't clamp/normalize odd data.

## Relationship to the sibling app

A sibling **Laravel** app at `../cricketoverlays` is the live broadcast-graphics/overlay
tool for the same club (typically on the Hostinger VPS). The two don't call each other —
they're **independent clients of the same CricClubs `mwcc` association API** sharing
credentials. That shared upstream is the only link.
