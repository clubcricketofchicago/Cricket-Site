# Deployment

The site is a Next.js 16 app backed by **Neon Postgres** (a mirror of CricClubs data)
plus **Craft CMS** for editorial content.

> **Current production:** deployed on **Vercel** under the club's account (team
> `ccc-2022`, project `cricket-site`), **GitHub-connected** to
> `clubcricketofchicago/Cricket-Site` → pushes to `main` auto-deploy. The domain
> `clubcricketofchicago.com` (apex + `www`) is attached to this project; DNS is at
> **Hostinger**. Env vars are set in **Vercel → Settings → Environment Variables
> (Production)**. The data sync runs through `.github/workflows/sync.yml` every eight
> hours. Its post-sync cache refresh requires the configuration in §5.

The rest of this doc is the generic runbook (for re-deploying or moving hosts). The steps
below configure a hosting environment from scratch.

## 1. Environment variables
Set every variable from [`.env.example`](.env.example) on the host (none are committed).
On Vercel: **Project Settings → Environment Variables** (Production scope).

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** endpoint (`-pooler` host) — app runtime |
| `DIRECT_URL` | Neon **direct** endpoint — schema push / sync |
| `X_API_KEY`, `X_CONSUMER_KEY` | CricClubs core API keys |
| `CRON_SECRET` | shared secret guarding `GET /api/sync` |
| `CACHE_REFRESH_SECRET` | shared secret guarding `POST /api/cache-refresh`; set the same value in Vercel Production and GitHub Actions repository secrets |
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

## 5. Keep data fresh — GitHub Actions and cache refresh

`.github/workflows/sync.yml` runs `npm run sync` every eight hours. Only after that
command succeeds does it POST to
`https://www.clubcricketofchicago.com/api/cache-refresh`. This small endpoint expires
the website's competitive-data cache; it does **not** run another sync or query Neon.
The next request for an expired entry reads the updated DB and caches it again.

Before enabling this hook in production:

1. Configure a strong `CACHE_REFRESH_SECRET` in **Vercel → Environment Variables →
   Production** and the same value in **GitHub → Settings → Secrets and variables →
   Actions → Repository secrets**. Do not commit, print, or place the value in a URL.
2. Deploy the code with that environment variable. Nothing in the running website
   changes until this code is deployed; adding the secret alone does not deploy it.
3. After deployment, let a successful sync run the refresh step. A missing secret,
   unavailable endpoint, or HTTP error fails that step visibly; it does not silently
   pretend the cache is fresh. The bounded retries only retry cache invalidation.

The hook targets the canonical production domain above. If the deployment moves,
update that URL in the workflow before configuring its secret. Do not point it at
a preview or a redirecting hostname. No hosting/account settings are changed by
the code itself.

Current/mixed competitive data has a **12-hour recovery TTL**, allowing delay around
the eight-hour sync schedule. Historical tournament seasons/fixtures use a separate
**30-day** cache that routine refreshes leave intact. API, calendar and generated
OpenGraph responses use `max-age=0, s-maxage=0, must-revalidate` with no HTTP SWR
window: the shared Next Data Cache owns reuse, so an independent CDN copy cannot
hide a successful refresh. This may increase function invocations, but cached
requests do not query Neon. See [the cache policy](docs/CACHE_POLICY.md) for details,
full-backfill refresh, and validation commands.

### Alternative: VPS cron

Use this instead of the GitHub schedule, not in addition to it. The frontend can
stay on Vercel while the VPS runs the sync without a Vercel function time limit.

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
# every 8 hours (also arrange the authenticated cache refresh after success)
0 */8 * * * /srv/cricket-site/scripts/sync-cron.sh
```

Each run appends to `logs/sync.log`. **Verify** with one manual run:

```bash
./scripts/sync-cron.sh && tail -n 30 logs/sync.log
```

Expect `✓` lines with row counts and `Done in <ms> — N ok, 0 failed.`
The VPS wrapper and standalone CLI do not automatically refresh a remote website's
cache. After a successful run, call `POST /api/cache-refresh` with
`Authorization: Bearer $CACHE_REFRESH_SECRET`, as described in the cache-policy doc.

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

With the alternative VPS sync cron from section 5, the whole stack — frontend,
sync, CMS — can live on one server you control. Point the refresh hook at that site.

## Notes
- **Neon auto-suspends when idle**. The first uncached DB read after a quiet period can
  have a cold-start delay; avoid keep-warm queries when conserving compute hours.
- `GET /api/sync` can run long (`maxDuration = 300`); ensure the host allows it
  (e.g. Vercel Pro for >10s functions).
- Editorial content (home blocks, sponsors, nav) still comes from the **Craft CMS**
  GraphQL endpoint — it must be reachable and populated in production.
- Remote image hosts are whitelisted in `next.config.ts` (`media.cricclubs.com`,
  `cricclubs.com`, the CMS host); most images render `unoptimized` so they work regardless.
