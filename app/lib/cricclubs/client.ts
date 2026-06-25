import { CRICCLUBS } from "./config";
import type { CricEnvelope } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class CricClubsError extends Error {
  constructor(
    message: string,
    readonly path: string,
    readonly code?: string | null
  ) {
    super(message);
    this.name = "CricClubsError";
  }
}

type Params = Record<string, string | number | undefined | null>;

/**
 * GET a CricClubs core endpoint and return its `data` payload.
 *
 * Handles both response shapes the API uses: an `{data, responseState, ...}`
 * envelope (most endpoints) and a bare array/object (e.g. /match/getMatches).
 * Retries transient failures with backoff. Never caches (data is live).
 */
export async function cricFetch<T = unknown>(
  path: string,
  params: Params = {},
  opts: { retries?: number; timeoutMs?: number } = {}
): Promise<T> {
  const { retries = 2, timeoutMs = 20000 } = opts;

  if (!CRICCLUBS.consumerKey || !CRICCLUBS.apiKey) {
    throw new CricClubsError(
      "Missing X_CONSUMER_KEY / X_API_KEY env vars",
      path
    );
  }

  const url = new URL(`${CRICCLUBS.baseUrl}${path}`);
  url.searchParams.set("association", CRICCLUBS.association);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "ccc-sync/1.0",
          "x-consumer-key": CRICCLUBS.consumerKey,
          "x-api-key": CRICCLUBS.apiKey,
        },
        cache: "no-store",
        signal: ctrl.signal,
      });

      if (!res.ok) {
        throw new CricClubsError(`HTTP ${res.status}`, path);
      }

      const body: unknown = await res.json();

      // Envelope shape: { data, responseState, errorMessage }
      if (body && typeof body === "object" && "responseState" in body) {
        const env = body as CricEnvelope<T>;
        if (env.responseState === false) {
          throw new CricClubsError(
            env.errorMessage || "responseState=false",
            path,
            env.errorCode
          );
        }
        return env.data as T;
      }

      // Bare shape (no envelope)
      return body as T;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(300 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new CricClubsError(String(lastErr), path);
}
