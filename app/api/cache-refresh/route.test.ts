import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { afterEach, beforeEach, mock, test } from "node:test";
import { POST } from "./route";
import { COMPETITIVE_DATA_TAG, HISTORIC_DATA_TAG } from "../../lib/data/cachePolicy";

const require = createRequire(import.meta.url);
const nextCache = require("next/cache") as typeof import("next/cache");
const calls: unknown[][] = [];
const testSecret = "cache-refresh-test-only";

beforeEach(() => {
  process.env.CACHE_REFRESH_SECRET = testSecret;
  calls.length = 0;
  mock.method(nextCache, "revalidateTag", (...args: unknown[]) => calls.push(args));
});

afterEach(() => {
  delete process.env.CACHE_REFRESH_SECRET;
  mock.restoreAll();
});

function request(auth?: string, scope = "") {
  return new Request(`https://example.test/api/cache-refresh${scope}`, {
    method: "POST",
    headers: auth ? { Authorization: auth } : {},
  });
}

test("missing server configuration fails closed, even for Bearer undefined", async () => {
  delete process.env.CACHE_REFRESH_SECRET;
  const response = await POST(request("Bearer undefined"));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(calls, []);
});

test("missing, malformed and incorrect credentials never invalidate data", async () => {
  for (const auth of [
    undefined,
    testSecret,
    `Basic ${testSecret}`,
    "Bearer incorrect",
    `Bearer ${testSecret}x`,
    `Bearer ${"x".repeat(testSecret.length)}`,
  ]) {
    const response = await POST(request(auth, "?scope=all"));
    assert.equal(response.status, 401);
  }
  assert.deepEqual(calls, []);
});

test("a successful routine refresh immediately expires current data only", async () => {
  const response = await POST(request(`Bearer ${testSecret}`));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { revalidated: true, scope: "current" });
  assert.deepEqual(calls, [[COMPETITIVE_DATA_TAG, { expire: 0 }]]);
});

test("an authenticated full backfill can expire historical data too", async () => {
  const response = await POST(request(`Bearer ${testSecret}`, "?scope=all"));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [
    [COMPETITIVE_DATA_TAG, { expire: 0 }],
    [HISTORIC_DATA_TAG, { expire: 0 }],
  ]);
});

test("invalid scopes cannot invalidate arbitrary tags or paths", async () => {
  const response = await POST(request(`Bearer ${testSecret}`, "?scope=arbitrary-tag"));
  assert.equal(response.status, 400);
  assert.deepEqual(calls, []);
});

test("invalidation errors fail the webhook without leaking internal details", async () => {
  mock.restoreAll();
  mock.method(nextCache, "revalidateTag", () => { throw new Error("internal details"); });
  const response = await POST(request(`Bearer ${testSecret}`));
  assert.equal(response.status, 500);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { error: "Cache refresh failed" });
});
