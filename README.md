# Club Cricket of Chicago — website

The public site for **Club Cricket of Chicago (CCC)**, a competitive cricket club in
Chicago. Live at **https://www.clubcricketofchicago.com**.

It shows the club's season hub, schedule, tournaments (standings + stat tables), player
roster and profiles, match scorecards, grounds, the academy, and a join-us form.

## How it's built

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 3**
- **Prisma + Neon Postgres** — a mirror of competitive cricket data
- **Craft CMS** (GraphQL) — editorial content (home blocks, sponsors, nav, grounds, academy)

**Data flow (hybrid):** fixtures, results, standings, player & tournament stats are
synced from the **CricClubs** API into **Neon Postgres** and read through cached
server-side helpers (`app/lib/data/*`); editorial content comes from **Craft CMS**. The
sync lives in `app/lib/sync` and runs via `GET /api/sync` (cron) or `npm run sync`.

UI is the **"Blue Hour / Chicago Dusk"** design system with light + dark mode and a traced
Chicago-skyline signature.

## Run locally

```bash
cp .env.example .env      # fill in DATABASE_URL + the CricClubs/CMS keys
npm install               # postinstall runs `prisma generate`
npx prisma db push        # apply the schema to your DB
npm run sync              # populate the DB from CricClubs (optional but recommended)
npm run dev               # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm run lint` | ESLint (`eslint app`) |
| `npm run sync` | Sync CricClubs → Postgres |
| `npm run db:push` / `db:studio` | Apply schema / open Prisma Studio |

## Docs

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — production deploy (Vercel) + the data-sync cron
- **[docs/DATA_LAYER.md](docs/DATA_LAYER.md)** — the CricClubs→Postgres data layer
- **[CLAUDE.md](CLAUDE.md)** — architecture guide for contributors / AI agents
- **[HUMAN.md](HUMAN.md)** — plain-English overview (no coding needed)

## Sibling project

`../cricketoverlays` is the club's live broadcast-overlay tool (Laravel) — a separate app
that shares the same CricClubs account but doesn't talk to this site.
