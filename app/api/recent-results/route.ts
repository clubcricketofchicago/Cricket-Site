import { NextResponse } from "next/server";
import { getRecentResults } from "../../lib/data/recentResults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await getRecentResults(6);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch (err) {
    return NextResponse.json(
      { results: [], error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
