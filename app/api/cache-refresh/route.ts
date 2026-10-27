import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { refreshCompetitiveCache } from "../../lib/data/refreshCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const secret = process.env.CACHE_REFRESH_SECRET;
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const scope = new URL(request.url).searchParams.get("scope") ?? "current";
  if (scope !== "current" && scope !== "all") {
    return NextResponse.json({ error: "Invalid scope" }, { status: 400, headers });
  }

  try {
    refreshCompetitiveCache(scope === "all");
    return NextResponse.json({ revalidated: true, scope }, { headers });
  } catch {
    return NextResponse.json({ error: "Cache refresh failed" }, { status: 500, headers });
  }
}
