import { ACTIVE_SEASON_YEAR, TRACKED_SERIES } from "../cricclubs/config";

export const COMPETITIVE_DATA_TAG = "cricclubs";
export const HISTORIC_DATA_TAG = "cricclubs-history";

// Sync runs every eight hours. The extra four hours allow for delayed jobs; this
// TTL is recovery for a missed refresh webhook, not the normal freshness path.
export const COMPETITIVE_CACHE = {
  revalidate: 12 * 60 * 60,
  tags: [COMPETITIVE_DATA_TAG],
};

// Routine syncs do not change past seasons. A full backfill can explicitly
// invalidate this tag with POST /api/cache-refresh?scope=all.
export const HISTORIC_CACHE = {
  revalidate: 30 * 24 * 60 * 60,
  tags: [HISTORIC_DATA_TAG],
};

export function isHistoricSeason(year?: string): boolean {
  return !!year && Number(year) < Number(ACTIVE_SEASON_YEAR) &&
    TRACKED_SERIES.some((series) => series.year === year);
}

export function isHistoricSeries(slug: string): boolean {
  return isHistoricSeason(TRACKED_SERIES.find((series) => series.id === Number(slug))?.year);
}

// Keep one authoritative, tag-invalidated Data Cache. An independent long-lived
// CDN/browser copy could hide a successful sync even after revalidateTag runs.
// Revalidating an HTTP response still reuses the cached DB reader for 12h/30d.
export const COMPETITIVE_RESPONSE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=0, must-revalidate",
};
