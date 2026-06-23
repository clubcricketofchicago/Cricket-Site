# CLAUDE.md — Cricket-Site

Guidance for AI agents working in this repository. Read this before editing.

## What this is

The **public-facing website for "Club Cricket of Chicago" (CCC)** — a competitive
cricket club/league in Chicago (`<title>Club Cricket of Chicago | Discover
Competitive Cricket</title>`, `app/layout.tsx`). It presents the club to fans and
prospective players: home page with hero/sponsors, a match **calendar/schedule**,
**tournaments** with standings and stat tables, a **players** roster with detailed
stats, a **grounds** gallery, a **CCC Academy** page, and a **join-us** recruitment
form. It is a content/marketing site, not an admin or live-scoring tool. Package
name is `ccc`; git remote `github.com/Harrythedevelopercs/Cricket-Site.git`.

## Data sources (important)

There is **no database** (no Prisma/Drizzle/Mongo/Supabase/SQL anywhere). The site
reads from two external services plus some static JSON:

1. **Craft CMS via GraphQL — the PRIMARY source.** Almost all page content (home,
   players, tournaments, fixtures, grounds, navigation, academy, sponsors,
   standings) comes from a headless **Craft CMS** GraphQL endpoint.
   - Client: `app/lib/graphqlClient.js` → `fetchGraphQL(query, variables)` does
     `POST https://cms.ccc.clubcricketofchicago.com/api`.
   - Queries are plain template-string builders in `app/lib/queries/*`
     (no Apollo/urql). Craft conventions confirm it: `entries(section:)`,
     `typeHandle`, `_Entry`, `globalSet`, `lightswitch`, a `homePageBlocks`
     Matrix field rendered by a `typeHandle` switch.
   - CMS **image** base URL comes from `process.env.NEXT_PUBLIC_CMS_URL`, with
     inconsistent fallbacks across files (`https://cms-ccc.ddev.site/` dev,
     `http://cms.ccc.clubcricketofchicago.com/` prod). Note these don't all match
     the GraphQL host or the `next.config` image whitelists.

2. **CricClubs core API — narrow scope, player stats only.** CricClubs IS used, but
   in exactly one place: the server route handler `app/api/player-stats/route.ts`
   proxies to
   `https://core-prod-origin.cricclubs.com/core/player/getStats?v=5.0.29&playerId={id}&association=mwcc`,
   forwarding env secrets `X_API_KEY` (`x-api-key`) and `X_CONSUMER_KEY`
   (`x-consumer-key`), `cache: "no-store"`. The proxy exists to keep keys
   server-side. It is called from `app/players/page.tsx` only when a user opens a
   player's "Show Full Stats" modal (`fetch('/api/player-stats?playerId=...')`).
   The player *roster* itself comes from the CMS, not CricClubs.
   - One other CricClubs reference (`app/components/ui/MatchDisplayEle.js` builds a
     `https://cricclubs.com` + `t1_logo_file_path` image URL) renders a **hardcoded
     placeholder** match (`PLACEHOLDER_UPCOMING_MATCH` in
     `app/components/calendar/UpcomingMatchPanel.tsx`), not live data.

3. **Static JSON** in `app/data/`: `data.json` (management team bios) and
   `grounds.json` (Chicago-area grounds). Appear to be legacy/static fallbacks; the
   live pages fetch equivalent data from the CMS.

**Verdict:** Primary content = Craft CMS GraphQL. CricClubs = on-demand player
batting/bowling stats only (no fixtures/standings/scores pulled from CricClubs in
active code).

### Rendering pattern
Every page is a **Client Component** (`'use client'`) and almost all declare
`export const dynamic = 'force-dynamic'`. Data is fetched **client-side in
`useEffect`**, held in `useState`, shown behind a loading/skeleton state, then
mapped to components. No SSR data fetching, no server actions, no caching strategy.

## Tech stack

- **Next.js `^16`** (App Router, Turbopack), **React `^19`**, **TypeScript `^5`**
  (`strict: true`) — but the codebase is **mixed `.js`/`.jsx` and `.ts`/`.tsx`**.
- **Tailwind CSS `^3`** + PostCSS; plus a large hand-written `app/globals.css`
  (~4,168 lines). Google fonts: Oswald, Roboto Condensed, Yantramanav.
- **framer-motion** (parallax), **swiper** (carousels), **react-tabs** (stat
  panels), **date-fns** (calendar), **swup** + `next-page-transitions` (page
  transitions), **emailjs-com** (join-us form).
- **shadcn/ui** is scaffolded (`components.json`) but the generated files in
  `src/components/ui/*` are **unused** (see below).
- ESLint 9 flat config (`next/core-web-vitals` + `next/typescript`).
- **No backend, no DB, no test framework.**

## Layout — `app/` is live, `src/` is dead

The real Next.js application is the **top-level `app/` directory** (App Router).

```
app/                          ← THE app (App Router)
  layout.tsx                  ← root layout ('use client'); Header + Footer wrap children
  page.js                     ← "/" home (renders CMS blocks by typeHandle)
  globals.css                 ← ~4,168 lines
  api/player-stats/route.ts   ← the ONLY route handler (CricClubs proxy)
  ccc-academy/page.js         ← "/ccc-academy"
  grounds/page.tsx            ← "/grounds"
  join-us/page.tsx            ← "/join-us" (EmailJS)
  players/page.tsx            ← "/players" (CMS roster + CricClubs stats modal)
  schedule/page.js            ← "/schedule" (calendar)
  tournaments/page.js         ← "/tournaments"
  tournaments/[year]/page.js          ← "/tournaments/[year]"
  tournaments/[year]/[slug]/page.js   ← "/tournaments/[year]/[slug]" (standings, stats)
  components/  ui/ calendar/ tournaments/ skeletons/   ← all REAL, in-use components
  data/{data.json,grounds.json}   ← static fallbacks
  hooks/useSwup.js
  lib/graphqlClient.js + lib/queries/*   ← CMS data client + GraphQL builders
  types/calendar.ts

src/                          ← LARGELY DEAD CODE
  components/ui/{drawer,popover,sheet}.tsx   ← shadcn, imported NOWHERE
  lib/utils.ts                ← cn() helper, imported nowhere

public/images/                ← CCC logos, ~40 team logos, 250+ country flags,
                                grounds photos, sponsors, og-images, league logos
```

**The `app/` vs `src/` situation (verified):** `tsconfig.json` sets
`baseUrl: "./src"` and alias `@/* → src/*`, but a repo-wide grep finds **zero**
imports of `@/...` or `src/components`. The `src/` shadcn files are orphaned
`npx shadcn init` scaffolding and are not part of the running app. Real components
are imported via **relative paths** from `app/components/...`.

## Routes (App Router) and the one API handler

Pages: `/`, `/ccc-academy`, `/schedule`, `/players`, `/grounds`, `/join-us`,
`/tournaments`, `/tournaments/[year]`, `/tournaments/[year]/[slug]`. There is **no
`pages/` directory** — purely App Router.

API: `GET /api/player-stats` (`app/api/player-stats/route.ts`) — the CricClubs
proxy described above. That is the only server-side code in the repo.

## Key components (`app/components/`)
- `ui/HeaderNavPanel.js` — CMS-driven nav + mobile menu, sticky-on-scroll.
- `ui/FooterPanel.js` — static footer with social + quick links.
- `ui/HeroBanner.js`, `FixturesGrid.js`, `MeetSquad.js`, `NewSeasonCounter.js` /
  `TimeCounter.js`, `SponsorsBanner.js`, `BGParralaxBanner.js`,
  `TournamentSection.js`, `PageTransition.js`.
- `calendar/DateCalendar.tsx` (month grid with team logos on match dates),
  `calendar/UpcomingMatchPanel.tsx` (next match / season countdown — currently a
  placeholder match).
- `tournaments/`: `FixturesAndResults.tsx`, `LeagueHighlights.js`,
  `LeagueLogoSlider.js`, `NumberZone.js`, `PlayerOfTheWeek.tsx`, and the stat
  tables `Render{Batting,Bowling,Fielding,Ranking}DataTable.js`.
- `skeletons/*` shimmer loaders. `players/page.tsx → PlayerCardEle` (gold/silver/
  bronze tiered cards; country flag from local `/images/nationality/{code}.svg`;
  stats modal hits `/api/player-stats`).

## Environment variables

- `NEXT_PUBLIC_CMS_URL` — public, base URL for CMS image assets.
- `X_API_KEY`, `X_CONSUMER_KEY` — server-side secrets for CricClubs, used only in
  `app/api/player-stats/route.ts`.
- **No `.env` / `.env.example` / `.env.local` is committed** (gitignored), so
  required vars are undocumented; only hardcoded fallbacks are visible in source.

## Commands (package.json)

`npm run dev` (`next dev`, Turbopack), `npm run build` (`next build`),
`npm run start` (`next start`), `npm run lint` (`next lint`). **No test script /
framework.**

## Gotchas / things to know before editing

- **`src/` is dead code** — don't add features there expecting them to load; put
  components in `app/components/`. The `@/*` alias is configured but unused.
- **Two Next configs coexist:** `next.config.js` (CJS, `images.domains:
  ['cms-ccc.ddev.site']`) and `next.config.ts` (ESM, `images.remotePatterns` for
  `ccc.cms.clubcricketofchicago.com` + localhost). Next.js prefers `.ts`; the `.js`
  one is likely stale. The image host whitelists don't match the actual CMS GraphQL
  host (`cms.ccc.clubcricketofchicago.com`).
- **Broken footer link:** `FooterPanel.js` links "Schedule" → `/calendar`, but the
  route is `/schedule` (no `/calendar` exists) → 404.
- **Hardcoded EmailJS credentials** (service/template/public key) in
  `join-us/page.tsx`.
- Data fetching is **entirely client-side** (`useEffect` + `force-dynamic`), which
  is unusual for a content site and not performance-optimal (no SSR/SSG/ISR/cache).
- **Metadata/SEO incomplete:** `app/layout.tsx` is a Client Component with a
  hardcoded `<title>`/`<meta>` in `<head>` instead of the Next.js Metadata API;
  per-page OG images exist as assets but aren't wired via `metadata` exports.
- Leftover/orphan files: `b.value` (0-byte at root), `app/lib/queries/
  playerConfigurationQuery - Copy.ts` (unreferenced backup), empty `app/.gitignore`,
  default unmodified create-next-app `README.md`. Many `console.log`s left in pages.
- Version mismatch: `next ^16.1.6` but `eslint-config-next` pinned `15.2.3`.

## Relationship to the sibling app

A sibling **Laravel** app lives at `../cricketoverlays` (live broadcast-graphics /
overlay tool for the same club). This site does **not** call that Laravel app, and
that app does not call this one. They are **independent clients of the same
CricClubs `mwcc` association API** sharing CricClubs credentials — that shared
upstream is the only link between them.
