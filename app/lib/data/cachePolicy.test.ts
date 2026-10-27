import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPETITIVE_CACHE,
  HISTORIC_CACHE,
  COMPETITIVE_RESPONSE_HEADERS,
  isHistoricSeason,
  isHistoricSeries,
} from "./cachePolicy";
import { ACTIVE_SEASON_YEAR, TRACKED_SERIES } from "../cricclubs/config";

test("current data survives an eight-hour sync interval with bounded recovery", () => {
  assert.ok(COMPETITIVE_CACHE.revalidate > 8 * 60 * 60);
  assert.ok(COMPETITIVE_CACHE.revalidate <= 24 * 60 * 60);
});

test("historic data stays cached across routine refreshes but has a recovery TTL", () => {
  assert.ok(HISTORIC_CACHE.revalidate >= 7 * 24 * 60 * 60);
  assert.ok(HISTORIC_CACHE.revalidate <= 30 * 24 * 60 * 60);
  assert.ok(HISTORIC_CACHE.tags.every((tag) => !COMPETITIVE_CACHE.tags.includes(tag)));
});

test("only known past seasons use the historical policy", () => {
  for (const series of TRACKED_SERIES) {
    const historic = Number(series.year) < Number(ACTIVE_SEASON_YEAR);
    assert.equal(isHistoricSeason(series.year), historic);
    assert.equal(isHistoricSeries(String(series.id)), historic);
  }
  for (const year of [undefined, "", "nonsense", "1900", "9999"]) {
    assert.equal(isHistoricSeason(year), false);
  }
  for (const slug of ["", "nonsense", "999999"]) {
    assert.equal(isHistoricSeries(slug), false);
  }
});

test("API and image HTTP caches cannot hide a post-sync data invalidation", () => {
  const value = COMPETITIVE_RESPONSE_HEADERS["Cache-Control"];
  assert.match(value, /(?:^|, )max-age=0(?:,|$)/);
  assert.match(value, /(?:^|, )s-maxage=0(?:,|$)/);
  assert.match(value, /must-revalidate/);
  assert.doesNotMatch(value, /stale-while-revalidate/);
});
