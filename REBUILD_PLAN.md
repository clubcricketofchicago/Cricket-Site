# Cricket-Site — Data Rebuild Plan (Hybrid: CricClubs → DB + Craft CMS)

**Status:** Plan for review. No code written yet.
**Date:** 2026-06-23
**Decisions locked:** Hybrid data model · DB + cron live **inside the Next.js app** · DB = **Postgres + Prisma** (free tier, e.g. Neon, or self-host).

---

## 0. TL;DR

Today the site fetches *everything* (including fixtures, results, standings) from **Craft CMS**, entirely client-side, with no database. That means cricket data already living in **CricClubs** is being **manually re-entered into the CMS** — the core pain point.

This plan makes **CricClubs the source of truth for factual/competitive data**, synced into a **local Postgres DB** via scheduled jobs, with the site **server-rendering from the DB**. **Craft CMS is retained only for editorial content** (home hero, sponsors, management, academy, navigation). Verified by live API probing: CricClubs exposes everything we need.

---

## 1. Data target (RESOLVED) + remaining confirmations

**✅ Data identity resolved (2026-06-23).** The committed default `clubId=1` was wrong
(it's "Cricket Milwaukee" / MPL). The correct target is:
- **CricClubs `clubId = 63`** = club **"Midwest Cricket Conference" (MWCC)** — the
  `association` param is **ignored**; `clubId` is the only selector.
- **Scope: season "Summer 2026" = `seriesID 359`** (a parent series), and the 3
  child divisions Club Cricket of Chicago plays in:

  | Division | seriesId | parent |
  |---|---|---|
  | Master Royal RedBall Premier | **361** | 359 |
  | Blast T20 | **362** | 359 |
  | RedBall Division II | **364** | 359 |

  (Other Summer 2026 children exist — Yash Premier 360, MWCC BPL Elite 363, ALNT 368 —
  but CCC does not play in them.)
- **"Club Cricket of Chicago" is a team**, fielding a separate entry per division:
  **teamIds 2677, 2686, 2714**. Roster = union/dedupe `getTeamPlayers` across these.
- Series have a **parent→child hierarchy** (`parentSeriesId`) → maps onto the
  site's `/tournaments/[year]/[slug]`.

**🔑 The existing site already keys tournaments by CricClubs seriesId.** Querying the
live CMS (`cms.ccc.clubcricketofchicago.com/api`, publicly readable) shows each
`tournamentPage`'s **`slug` IS the CricClubs `seriesID`**. So mapping the current
content to CricClubs is **1:1 and automatic** — the route `/tournaments/{year}/{slug}`
already carries the seriesId. Currently published (verified to return live data):

| Year page | Tournament (CMS title) | slug = seriesId | CricClubs matches |
|---|---|---|---|
| 2024 | Master Royal Red Ball 2024 | **300** | 82 |
| 2024 | Master Royal RedBall 2024 Playoffs | **312** | 7 |
| 2025 | RedBall Premier 2025 | **330** | 66 |
| 2025 | Red Ball Div II 2025 | **331** | 49 |
| 2025 | SBCC T20 Blast 2025 | **333** | 61 |

The CMS only has **2024 & 2025** year pages today (no 2026). **Full scope to ingest** =
these 5 historical series **+ Summer 2026** (`359` → divisions `361`/`362`/`364`).
Today these tournaments' standings/stat-tables/results are **hand-entered** into Craft
keyed by seriesId — exactly the double-entry this rebuild removes by pulling them live.

**Remaining confirmations:**
1. **Coverage scope.** For the 3 divisions, show the **full division** data (all teams'
   fixtures, results, standings — needed for a real points table) and surface CCC's own
   games/roster within it? *(Recommended.)* Or strictly **CCC-team-only**? Standings
   require all teams in a division regardless.
2. **Roster unification.** Treat CCC's 3 per-division teamIds as **one squad**
   (union + dedupe by playerID) for the players page? *(Recommended.)*
3. ~~Standings source.~~ **RESOLVED** — native `/team/getPointsTable` returns the full
   table (won/lost/tied/NR/points/NRR/runs/wkts). No need to compute.
4. ~~Tournament stat tables.~~ **RESOLVED** — `/stats/get{Batting,Bowling,Feilding}Stats`
   return the Number Zone leaderboards directly; rankings = join their `points`. No
   CMS curation or scorecard-computation needed. *(Player-of-the-Week, if still wanted
   as editorial, stays CMS; otherwise top stat row covers it.)*
5. **Deployment target.** Vercel vs VPS/self-host → decides cron mechanism + DB host.
6. **Points/NRR rules** (e.g. win = 2, tie/NR = 1, loss = 0) to compute standings.
7. **History.** Just Summer 2026, or also backfill prior seasons (the club has ~100
   series back to earlier years) for an archive?

---

## 2. Target architecture

```
                 ┌─────────────────────────── CricClubs core API ───────────────────────────┐
                 │  https://core-prod-origin.cricclubs.com/core   (association=mwcc, clubId=1) │
                 └───────────────┬──────────────────────────────────────────────────────────-┘
                                 │  scheduled sync jobs (cron) — server-side, keys never exposed
                                 ▼
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │  Next.js app (Cricket-Site)                                                        │
   │                                                                                    │
   │   /api/sync/* route handlers ──► mappers ──► Prisma ──►  ┌──────────────────────┐  │
   │        (guarded by CRON_SECRET)                          │  Postgres (Neon/...)  │  │
   │                                                          │  series, teams,       │  │
   │   standings recompute from `matches` ───────────────────►│  players, rosters,    │  │
   │                                                          │  fixtures, matches,   │  │
   │   Server Components / route loaders ◄────────────────────│  player_stats,        │  │
   │        read from DB (ISR/cache)                          │  standings, sync_state│  │
   │                                                          └──────────────────────┘  │
   │                                                                                    │
   │   Editorial blocks (home hero, sponsors, management, academy, nav)                 │
   │        └──► fetchGraphQL() ──► Craft CMS (unchanged)                               │
   └──────────────────────────────────────────────────────────────────────────────────┘
```

Two big changes vs today: (1) a **DB fed by CricClubs** becomes the source of truth for cricket facts; (2) pages move from **client-side `useEffect` fetching** to **server components reading the DB** (faster, cacheable, SEO-friendly).

---

## 3. Verified CricClubs API surface (the inputs)

All GET, base `https://core-prod-origin.cricclubs.com/core`, headers `x-consumer-key: 23June^MWCC` + `x-api-key: MWCC^25` (+ `User-Agent`, `Accept`). **Selector = `clubId=63`** (the `association` param is ignored, but keep `association=mwcc` for parity). "Tournament" = **series** (with `parentSeriesId` hierarchy).

| Purpose | Endpoint | Verified |
|---|---|---|
| Series/tournaments list | `/series/getSeriesList?association=mwcc&clubId=63` | ✅ (Summer 2026 + children) |
| Upcoming fixtures | `/match/getSchedule?association=mwcc&clubId=63` | ✅ (326 fixtures) |
| Completed results (per series) | `/match/getMatches?association=mwcc&clubId=63&seriesId={361\|362\|364}` | ✅ |
| Team detail | `/team/getTeam?association=mwcc&clubId=63&teamId={id}` | ✅ |
| Team roster | `/team/getTeamPlayers?association=mwcc&clubId=63&teamId={2677\|2686\|2714}` | ✅ |
| Player career stats | `/player/getStats?v=5.0.29&X-Auth-Token={tok}&playerId={id}&association=mwcc` | ✅ |
| Match scorecard | `/scoreCard/getScoreCard?matchId={id}&clubId=63` | ✅ |
| Ball-by-ball | `/scoreCard/getBallByBall?matchId={id}&clubId=63` | ✅ |
| **Standings / points table** | `/team/getPointsTable?clubId=63&seriesId={id}` | ✅ (won/lost/tied/NR/points/NRR/runs/wkts) |
| **Teams in a series** | `/team/getTeamsList?clubId=63&seriesId={id}` | ✅ |
| **Batting stat table** | `/stats/getBattingStats?clubId=63&seriesId={id}[&teamId=]` | ✅ |
| **Bowling stat table** | `/stats/getBowlingStats?clubId=63&seriesId={id}[&teamId=]` | ✅ |
| **Fielding stat table** | `/stats/getFeildingStats?clubId=63&seriesId={id}[&teamId=]` | ✅ (note API misspelling "Feilding") |
| **Player bio/profile** | `/user/getUserDetails?playerId={id}` | ✅ |
| Series details | `/series/getSeriesDetails?clubId=63&seriesId={id}` | 🔒 needs authed role token |
| Series highlights/numbers | `/series/getNumbers?clubId=63&seriesId={id}` | 🔒 needs authed role token |
| Player rankings | `/league/getPlayerRankings?clubId=63&seriesId={id}` | 🔒 needs authed role token (derive instead) |

Source: official **MWCC CricClubs API docs** (`API - MWCC.docx`, `MWCC - CricClubs APIs.pdf`). Auth = headers `x-consumer-key: 23June^MWCC` + `x-api-key: MWCC^25` (confirmed in the docx). The 🔒 three return *"Unauthorized Access — login with valid role"* with our keys; they need a logged-in admin `X-Auth-Token`. **None are required** — their data is resolvable from the ✅ endpoints (see Field Resolution below).

Image assets (browser, not DB): `https://media.cricclubs.com{profilepic_file_path}`, `https://cricclubs.com{logo_file_path}`.

---

## 4. Database schema (Prisma models)

Natural keys from CricClubs are reused as primary keys so all syncs are idempotent **upserts**. Unix timestamps converted to `DateTime`. `synced_at` on every table for staleness tracking.

| Table | Source endpoint | Key columns (→ CricClubs field) |
|---|---|---|
| **series** | `getSeriesList` | `id`(seriesID) · `name`(seriesName) · `type`(seriesType) · `year` · `level` · `parent_series_id` · `start_date` |
| **teams** | `getTeam` (+ names from schedule/matches) | `id`(teamID) · `name` · `code`(teamCode) · `logo_path`(logo_file_path) · `captain_id`/`captain_name` · `vice_captain_id`/`vice_captain_name` · `group_no`(group) · `home_ground` |
| **players** | `getTeamPlayers`, `getStats` | `id`(playerID) · `first_name` · `last_name` · `profilepic_path` · `playing_role` |
| **team_rosters** | `getTeamPlayers` | (`team_id`,`player_id`) PK · `jersey_number` · `role` |
| **fixtures** | `getSchedule` | `id`(fixtureId) · `series_id` · `team_one_id`/`team_two_id` · `date`(fixedFormatDate) · `time` · `day` · `ground_id`/`location`/`google_maps_link` · `match_id`(0 until played) · `match_type` · `status_desc` · `match_datetime` |
| **matches** | `getMatches` | `id`(matchId) · `series_id`(+name) · `club_id`/`club_name` · `team_one_id`/`team_two_id`(+names/codes) · `overs`/`no_of_balls_per_over` · innings totals `t1total/t1wickets/t1balls` + `t1_1*`/`t1_2*` (and t2…) · `t2_revised_overs` · `is_complete`/`is_dls`/`is_followon` · `status` · `result`(text) · `winner`(team id) · `match_date` · `location` · `live_streaming_link` · `last_updated_date` |
| **player_batting_stats** | `getStats.battingStats[]` | (`player_id`,`series_type`) PK · matches · innings · runs · balls · hs · avg · sr · 4s · 6s · 50s · 100s |
| **player_bowling_stats** | `getStats.bowlingStats[]` | (`player_id`,`series_type`) PK · matches · innings · overs · runs · wickets · best · avg · econ · sr · maidens |
| **match_scorecards** *(opt, Phase 2)* | `getScoreCard` | `match_id` PK · `innings` JSON (per-innings batting/bowling detail) |
| **standings** *(computed)* | derived from **matches** | (`series_id`,`team_id`) PK · played · won · lost · tied · no_result · points · runs_for · balls_for · runs_against · balls_against · `nrr` |
| **sync_state** | — | `entity` PK (e.g. `matches:25`, `roster:271`) · `last_synced_at` · `last_status` · `last_error` · `item_count` |

Notes: rosters are **team-level/current** (no series scoping observed). `matches.winner` is a team id; `result` is human text. `fixtures.match_id` links a fixture to its `matches` row once scored.

---

## 5. Sync layer

- **One mapper module per endpoint** (`lib/cricclubs/fetchSeries.ts`, `fetchSchedule.ts`, `fetchMatches.ts`, `fetchTeam.ts`, `fetchRoster.ts`, `fetchPlayerStats.ts`, `fetchScorecard.ts`). Each: call endpoint → validate `responseState` envelope → map fields → Prisma `upsert` → update `sync_state`.
- **A shared client** wrapping auth headers + base URL + `association`/`clubId` from env, with retry/backoff and a timeout. Reuses the proven request recipe.
- **Orchestration order** (respects FKs): series → teams → rosters/players → fixtures → matches → player_stats → recompute standings.
- **Idempotent**: re-running any sync is safe (upsert by natural key). Historical backfill = loop `getMatches` over every `seriesId` from `getSeriesList`.
- **Standings computation** from `matches`: for each completed match in a series, credit the `winner` (points per league rules in §1.5), accumulate runs/balls for & against per team, compute **NRR = (runs_for/overs_for) − (runs_against/overs_against)**. Write `standings` rows. (Swap for the native endpoint later if cracked.)

---

## 6. Cron cadence

Tiered by how often each dataset actually changes:

| Job | Cadence | Why |
|---|---|---|
| `matches` (results) + scorecards | every ~10 min on match days (weekends/season), hourly otherwise | `status:"live"` games update frequently |
| `standings` recompute | after each `matches` sync | derived |
| `fixtures` (schedule) | daily | dates shift occasionally |
| `teams` + `rosters` | daily | rosters change slowly |
| `series` list | weekly | new season added rarely |
| `player_stats` | weekly + lazy on-demand (cache 24h when a modal opens) | heavy, slow-changing |

**Mechanism:** secured route handlers `GET /api/sync/{entity}` requiring `Authorization: Bearer ${CRON_SECRET}`. On Vercel → `vercel.json` cron entries. Self-hosted → system cron or a small `node-cron` worker hitting those routes.

---

## 7. Page read-path migration (client → server, DB-backed)

| Route | Today | After |
|---|---|---|
| `/` home | CMS blocks (client) | CMS editorial blocks **+** "upcoming fixtures" & "recent results" from DB (server) |
| `/schedule` | CMS fixtures (client) | **fixtures** from DB (server, ISR) |
| `/tournaments`, `/[year]`, `/[year]/[slug]` | CMS (client) | **series** + **matches** (results) + computed **standings** from DB; stat tables per §1.3 |
| `/players` | CMS roster + live stats modal | **rosters/players** from DB; stats modal from **player_stats** (DB-cached) |
| `/grounds` | CMS/static | from DB grounds (distinct from fixtures) or keep CMS — your call |
| `/ccc-academy`, `/join-us` | CMS / EmailJS | **unchanged** (editorial) |

Convert pages from `'use client'` + `useEffect` + `force-dynamic` to **server components** reading Prisma, with `revalidate` (ISR) for caching. Editorial blocks still call `fetchGraphQL` server-side.

---

## 8. Config, secrets & hygiene

Create the missing **`.env.example`** and move all secrets to env (today some are hardcoded fallbacks / committed):

```
DATABASE_URL=postgresql://...
CRICCLUBS_BASE_URL=https://core-prod-origin.cricclubs.com/core
CRICCLUBS_ASSOCIATION=mwcc
CRICCLUBS_CLUB_ID=1
X_CONSUMER_KEY=...        # was hardcoded in cricketoverlays/config/services.php
X_API_KEY=...
CRICCLUBS_AUTH_TOKEN=...  # for player/getStats
NEXT_PUBLIC_CMS_URL=https://cms.ccc.clubcricketofchicago.com/
CRON_SECRET=...
```
**Rotate** the currently-committed CricClubs keys after cutover (they're in git history). Also during this work: delete the dead `src/` scaffolding, reconcile the two `next.config.*` files, fix the broken footer `/calendar`→`/schedule` link, and move EmailJS keys to env.

---

## 9. Phased rollout

- **Phase 0 — Setup & confirmations.** Resolve §1 (esp. data identity). `prisma init`, choose DB host, add `.env`, wire the shared CricClubs client.
- **Phase 1 — Core sync.** Models + syncs for **series, teams, fixtures, matches**. Backfill historical series. Verify counts against the CricClubs site.
- **Phase 2 — People.** **rosters, players, player_stats** sync + DB-cache the stats modal.
- **Phase 3 — Standings.** Compute from `matches` (or wire native endpoint if you supply the request). Validate vs the live points table.
- **Phase 4 — Read migration.** Convert pages to server components reading the DB; keep CMS editorial blocks. Ship behind a flag / parallel-run and compare.
- **Phase 5 — Cron + cleanup.** Wire cron, add monitoring/alerts on `sync_state`, code hygiene (§8), key rotation.

**Verification gate each phase:** compare DB rows to the CricClubs source (spot-check a series' fixtures, a match's scores, a team's roster, a player's stats) before moving on.

---

## 10. Risks

- **Undocumented, unversioned API** — fields/paths could change without notice (note the `v=5.0.29` param). Mitigate with the envelope check + `sync_state` alerts.
- **Unknown rate limits** — be polite (sequential historical backfill, backoff).
- **Standings accuracy** — depends on correct points/NRR rules (§1.5); validate against the live table.
- **Credential hygiene** — keys are in git history; rotate.
- **Data identity** (§1.1) — building on the wrong association/clubId would populate the site with the wrong club's data.

---

## 11. Cost

- **Prisma:** free, open-source.
- **Postgres:** free software. Hosting free on **Neon**/**Supabase**/**Vercel Postgres** free tiers, or self-hosted. Only paid if you outgrow free-tier storage/traffic — unlikely for a club site.
- **Cron:** Vercel Cron included on its plans; system/node-cron free when self-hosting.
- Net new recurring cost at this scale: **~$0**.

---

## 12. Field resolution map (site field → CricClubs)

Confirmed every field the current site renders is resolvable. `✅` = direct from a
key-authed endpoint; `↳derive` = computed/joined from working endpoints; `CMS` =
editorial-only (no CricClubs equivalent).

**Tournament page** (`/tournaments/{year}/{slug}`, slug = seriesId):
| Site field (CMS) | Source |
|---|---|
| title / slug / type / year | ✅ `getSeriesList` |
| teamStandings (team, logo, wins, loses) | ✅ `getPointsTable` (.teams[].team + won/lost) — also points, NRR, runs/wkts |
| battingNumberZone (player, mat, ins, bf, runs, 4s, 6s, 50s, 100s, no, hs) | ✅ `getBattingStats` |
| bowlingNumberZone (mat, ins, balls, runs, wkts, pts, cths, 4w, 5w, db) | ✅ `getBowlingStats` |
| fieldingNumberZone (mat, cths, wc, dr, idr, stm, total) | ✅ `getFeildingStats` |
| rankingZone (batting/bowling/fielding/other/total points) | ↳derive: join `points` from the 3 stats endpoints per playerID |
| batsman/bowler-of-tournament (name, image, label, value) | ✅ top row of `getBattingStats` / `getBowlingStats` |
| topPlayers (name, image, value, position) | ✅ top rows of stats endpoints |
| resultCards (date, t1/t2 score+overs, logos) | ✅ `getMatches` (matchDate, t1total/wickets, overs, logos) |
| leagueStats / teamBatting / teamBowling (infoCard numbers) | ↳derive: aggregate from `getMatches` + stats (or `getNumbers` if an authed token is provided) |
| flagImage (series banner) | CMS (editorial) |

**Players page**: name/role/jersey/photo/playerid ✅ `getTeamPlayers` (union teamIds 2677/2686/2714); matches/runs/wickets ✅ `getStats`; bio (DOB, styles, age, photo) ✅ `getUserDetails`; **tier (`scorebycaptain` gold/silver/bronze) = CMS** (a curated rating, not in CricClubs); country/flag = `getUserDetails`/CMS.

**Schedule / home fixtures**: ✅ `getSchedule`. **Player stats modal**: ✅ `getStats` (already live).

**Optional unlock:** the 3 🔒 endpoints (`getSeriesDetails`, `getNumbers`, `getPlayerRankings`) work if the club provides a logged-in admin `X-Auth-Token`. Not required — all their fields are covered above.
