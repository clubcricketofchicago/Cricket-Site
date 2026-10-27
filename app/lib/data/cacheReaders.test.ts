import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { COMPETITIVE_CACHE, HISTORIC_CACHE } from "./cachePolicy";
import { ACTIVE_SEASON_YEAR, TRACKED_SERIES } from "../cricclubs/config";

const require = createRequire(import.meta.url);
const nextCache = require("next/cache") as typeof import("next/cache");

test("every competitive reader uses the shared policy, with isolated historical seasons", async (t) => {
  const selectedPolicies: unknown[] = [];
  // Exercise the actual reader exports and year/series dispatch, without calling
  // a reader's DB callback or requiring a running Next server.
  t.mock.method(nextCache, "unstable_cache", (_callback: unknown, _keys: unknown, options: unknown) => async () => {
    selectedPolicies.push(options);
  });

  const readers = await Promise.all([
    import("./home").then((m) => () => m.getHomeData()),
    import("./player").then((m) => () => m.getPlayerProfile(1)),
    import("./players").then((m) => () => m.getPlayerEntries()),
    import("./matchReports").then((m) => () => m.getMatchReports()),
    import("./recentResults").then((m) => () => m.getRecentResults()),
    import("./records").then((m) => () => m.getClubRecords()),
    import("./schedule").then((m) => () => m.getCalendarEntries()),
    import("./clubHistory").then((m) => () => m.getClubHistoryTotals()),
  ]);
  const { getTournamentList, getTournamentEntries, getFixtureEntries } = await import("./tournaments");
  readers.push(
    () => getTournamentList(),
    () => getTournamentEntries(),
    () => getTournamentEntries(ACTIVE_SEASON_YEAR),
    () => getTournamentEntries("unknown"),
    () => getFixtureEntries("unknown")
  );
  for (const read of readers) {
    selectedPolicies.length = 0;
    await read();
    assert.deepEqual(selectedPolicies, [COMPETITIVE_CACHE]);
  }

  const { getMatchCard } = await import("./match");
  selectedPolicies.length = 0;
  await getMatchCard(1);
  assert.deepEqual(selectedPolicies, [HISTORIC_CACHE, COMPETITIVE_CACHE]);

  for (const series of TRACKED_SERIES) {
    selectedPolicies.length = 0;
    await getTournamentEntries(series.year);
    await getFixtureEntries(String(series.id));
    const expected = Number(series.year) < Number(ACTIVE_SEASON_YEAR)
      ? HISTORIC_CACHE
      : COMPETITIVE_CACHE;
    assert.deepEqual(selectedPolicies, [expected, expected], `series ${series.id}`);
  }
});
