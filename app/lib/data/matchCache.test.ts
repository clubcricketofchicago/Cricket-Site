import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const nextCache = require("next/cache") as typeof import("next/cache");

test("current refresh preserves historical match reads but refreshes current matches", async (t) => {
  const stores: Array<{ tags: string[]; values: Map<string, unknown> }> = [];
  let dataLoads = 0;

  t.mock.method(nextCache, "unstable_cache", (callback: (...args: unknown[]) => unknown, keys: string[], options?: { tags?: string[] }) => {
    const store = { tags: options?.tags ?? [], values: new Map<string, unknown>() };
    const namespace = keys.join(":");
    stores.push(store);
    return async (...args: unknown[]) => {
      const key = JSON.stringify(args);
      if (store.values.has(key)) return store.values.get(key);
      let value: unknown;
      if (namespace === "match-series") {
        value = args[0] === 5001 ? 330 : 361;
      } else if (namespace === "historic-match-card" || namespace === "current-match-card") {
        dataLoads += 1;
        value = { matchId: args[0], found: true };
      } else {
        value = await callback(...args);
      }
      store.values.set(key, value);
      return value;
    };
  });
  t.mock.method(nextCache, "revalidateTag", (tag: string) => {
    for (const store of stores) {
      if (store.tags.includes(tag)) store.values.clear();
    }
  });

  const { getMatchCard } = await import("./match");
  const { refreshCompetitiveCache } = await import("./refreshCache");

  await getMatchCard(5001);
  assert.equal(dataLoads, 1, "initial historical read loads its scorecard");
  await getMatchCard(5001);
  assert.equal(dataLoads, 1, "historical repeat is warm");

  refreshCompetitiveCache();
  await getMatchCard(5001);
  assert.equal(dataLoads, 1, "current-only refresh does not reload historical match data");

  await getMatchCard(6001);
  assert.equal(dataLoads, 2, "initial current read loads its scorecard");
  await getMatchCard(6001);
  assert.equal(dataLoads, 2, "current repeat is warm");

  refreshCompetitiveCache();
  await getMatchCard(6001);
  assert.equal(dataLoads, 3, "current-only refresh reloads the current scorecard");
  await getMatchCard(5001);
  assert.equal(dataLoads, 3, "historical data remains database-free after later refreshes");
});
