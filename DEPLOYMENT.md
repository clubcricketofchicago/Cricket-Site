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

## 5. Keep data fresh (cron) — runs on the VPS, not Vercel
The frontend is on Vercel, but the **sync runs from a system cron on the VPS**. That avoids
Vercel's function time limit entirely (the full sync can take minutes) and needs no Pro plan.

On the VPS, check out this repo *just for the sync* (the site itself stays on Vercel):

```bash
git clone <repo-url> /srv/cricket-site && cd /srv/cricket-site
npm ci --include=dev          # tsx (used by `npm run sync`) is a devDependency
cp .env.example .env          # then fill DATABASE_URL + the X_*/CRICCLUBS_* keys
chmod +x scripts/sync-cron.sh
```

Add the crontab entry (edit the PATH line in `scripts/sync-cron.sh` first if node isn't on
cron's default PATH — e.g. nvm installs):

```cron
# every 6 hours
0 */6 * * * /srv/cricket-site/scripts/sync-cron.sh
```

Each run appends to `logs/sync.log`. **Verify** with one manual run:

```bash
./scripts/sync-cron.sh && tail -n 30 logs/sync.log
```

Expect `✓` lines with row counts and `Done in <ms> — N ok, 0 failed.`

> **Alternative — Vercel Cron:** add a `vercel.json` with a `crons` entry hitting
> `GET /api/sync` (the route already validates `Authorization: Bearer $CRON_SECRET`, which
> Vercel attaches automatically). But it runs as a Vercel function, so it needs **Pro**
> (Hobby caps functions at 60s and crons at once-daily).

## Self-host the whole frontend on the VPS (instead of Vercel)
Puts the Next.js site on the **same Hostinger VPS** as the CMS + sync cron, fully under
your control and with no Vercel function limits. Config templates live in [`deploy/`](deploy/).

**Prereqs on the VPS:** Node 20+, nginx (already running for the CMS), and ~2 GB RAM free
for `next build` (add swap if the plan is small).

```bash
# 1) check out the repo
sudo git clone <repo-url> /srv/cricket-site && cd /srv/cricket-site
sudo chown -R "$USER":"$USER" /srv/cricket-site

# 2) env + build
cp .env.example .env            # fill in the real values
npm ci && npm run build

# 3) run it as a service (edit User= and paths in the unit first)
sudo cp deploy/cricket-site.service /etc/systemd/system/cricket-site.service
sudo systemctl daemon-reload && sudo systemctl enable --now cricket-site
curl -I localhost:3000          # expect HTTP 200

# 4) reverse proxy + TLS
sudo cp deploy/nginx-cricket-site.conf /etc/nginx/sites-available/cricket-site
sudo ln -s /etc/nginx/sites-available/cricket-site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d clubcricketofchicago.com -d www.clubcricketofchicago.com
```

**5) Point the domain at the VPS** — in the **Hostinger DNS panel** for
`clubcricketofchicago.com` (DNS already lives there), change the records currently aimed at
Vercel to the VPS IP (`93.127.215.201`, the same box as the CMS):

| Record | From (Vercel) | To (VPS) |
| --- | --- | --- |
| `@` apex `A` | `216.198.79.1` | `93.127.215.201` |
| `www` `CNAME` → | `…vercel-dns-017.com` | `A` → `93.127.215.201` |

Within the DNS TTL the public domain serves from the VPS. The domain itself never changes.
(Optional cleanup: remove the domain from the Vercel project afterward.)

**Future deploys:** `cd /srv/cricket-site && ./deploy/deploy.sh` (pull → build → restart).
Wire it to a GitHub Action / webhook for push-to-deploy if you want.

The sync cron (section 5) already runs on this same box, so the whole stack — frontend,
sync, CMS — lives on one server you control.

## Notes
- **Neon auto-suspends when idle**, so the first request after a quiet period is a slow
  cold start (not a bug). A keep-warm ping or an always-on Neon plan avoids it.
- `GET /api/sync` can run long (`maxDuration = 300`); ensure the host allows it
  (e.g. Vercel Pro for >10s functions).
- Editorial content (home blocks, sponsors, nav) still comes from the **Craft CMS**
  GraphQL endpoint — it must be reachable and populated in production.
- Remote image hosts are whitelisted in `next.config.ts` (`media.cricclubs.com`,
  `cricclubs.com`, the CMS host); most images render `unoptimized` so they work regardless.
