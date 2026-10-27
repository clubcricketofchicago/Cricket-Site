# Competitive-data caching

Competitive readers share the policy in `app/lib/data/cachePolicy.ts`. It applies
to the server pages, metadata loaders, API handlers, calendar feed, and generated
player/match OpenGraph images because those callers use the same data readers.
Editorial CMS content keeps its existing behavior.

| Data | Cache TTL | Invalidated by |
| --- | --- | --- |
| Current or mixed seasons, roster, home, results, reports, records, player profiles and current match cards | 12 hours | Every successful sync refresh (`cricclubs`) |
| A known historical tournament year, its fixture reader, and historical match cards | 30 days | Full-backfill refresh only (`cricclubs-history`) |

Twelve hours covers the eight-hour sync interval with room for a delayed run. It is
a recovery mechanism if the webhook fails, not a polling schedule. Expiry causes
a refresh on a later request. Historical entries have their own tag so routine
syncs do not drop them. All-season aggregates include current data and therefore
use the current policy. Match readers use a cached series lookup to select the
historical or current policy. Historical player pages still use the current policy.

## Refresh after sync

The Actions workflow invokes this endpoint **only after `npm run sync` exits 0**:

```http
POST /api/cache-refresh
Authorization: Bearer <CACHE_REFRESH_SECRET>
```

Set `CACHE_REFRESH_SECRET` to the same strong value in Vercel **Production** and
GitHub Actions **repository secrets**, then deploy the endpoint and cache policy.
Nothing in the running website changes until deployed. The production hook URL is
`https://www.clubcricketofchicago.com/api/cache-refresh`; use the final canonical
hostname, without a redirect. No Neon access, Vercel account credentials, or GitHub
API token is needed by this endpoint, and it does not change provider settings.

The endpoint only calls `revalidateTag(tag, { expire: 0 })`; it neither runs sync nor
warms the cache. The next read of each invalidated entry fetches current data. It
returns 200 with `revalidated: true` on success, 401 for missing/mismatched auth
(including a missing server secret), 400 for an invalid scope, and 500 if
invalidation fails. Only POST is supported. Responses are `no-store`. The workflow
fails visibly on missing configuration or HTTP errors and retries transient
failures within a bounded interval. A failed or partial sync never invokes the
workflow hook. The authenticated `/api/sync` route uses the same invalidation
function after a completely successful in-process sync.

After an intentional `SYNC_ALL=1` backfill or historical correction, use:

```http
POST /api/cache-refresh?scope=all
Authorization: Bearer <CACHE_REFRESH_SECRET>
```

This expires both current and historical tags. The normal workflow does not
backfill historical seasons. A standalone/VPS CLI run must arrange this refresh
separately after success; there is no implicit cross-host invalidation.

## HTTP caches and freshness

Data readers use the long-lived Next Data Cache. Competitive API responses,
calendar responses, and generated OpenGraph images consistently advertise:

```text
Cache-Control: public, max-age=0, s-maxage=0, must-revalidate
```

There is no independent HTTP `stale-while-revalidate` window. This deliberately
keeps cached responses from hiding a completed webhook: on-demand invalidation
of the server Data Cache does not generally invalidate an independently cached
CDN response. See [Next's CDN caching guidance](https://nextjs.org/docs/app/guides/cdn-caching).
Using zero HTTP freshness still reuses the long-lived DB result; it trades some
function invocations for reliable post-sync freshness without an additional CDN
purge API or credential. Browser tabs already displaying client state and social
platforms' own image caches update only when they request content again.

This is not a guarantee of zero Neon usage between syncs. First requests for new
keys, invalidated keys, eviction, separate deployments/regions, and recovery-TTL
expiry can still read the DB. The fix removes recurring 2–10-minute refreshes of
warm entries. Query/index optimization, snapshot publication, write batching,
unknown-ID protection and endpoint sizing are separate follow-ups.

## Validation

```bash
npm run test:cache
npx tsc --noEmit
npm run lint
npm run build
```

The cache tests check coverage of the sync interval, finite recovery TTLs,
historical-season classification/tag isolation, and HTTP cache freshness. A reader
wiring test exercises every competitive reader and the current/historical dispatch
with cache callbacks stubbed, so it cannot query Neon. Endpoint
tests execute the actual POST handler with Next's tag invalidation mocked: they
check missing configuration, invalid authentication, routine/full invalidation,
invalid scope and internal errors without a database or live server.

After a later authorized deployment, confirm that a successful sync's refresh
step succeeds; request a previously cached API response before/after a controlled
data update and verify the next response reflects the update. Inspect Neon usage
over a day/week to assess savings. This change does not alter compute size, revive
a quota-suspended endpoint, or guarantee the Free allowance for unknown traffic.
