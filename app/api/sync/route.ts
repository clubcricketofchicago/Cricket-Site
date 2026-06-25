import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { syncAll } from "../../lib/sync";

// Prisma needs the Node.js runtime; the sync can run long.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Triggers a full CricClubs -> DB sync. Protect with a shared secret so only your
 * cron (e.g. Vercel Cron) can call it:
 *   GET /api/sync   with header  Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await syncAll();
    // Bust the DB-backed caches (home/tournaments/match/player are unstable_cache'd with
    // the "cricclubs" tag) so freshly synced data is served immediately instead of
    // waiting out each route's revalidate window. Next 16 requires the second profile
    // arg; "max" is Next's recommended value for route-handler tag purges.
    revalidateTag("cricclubs", "max");
    const failed = Object.entries(summary.steps).filter(
      ([, s]) => s.status === "error"
    );
    return NextResponse.json(
      { ok: failed.length === 0, failed: failed.map(([e]) => e), ...summary },
      { status: failed.length === 0 ? 200 : 207 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
