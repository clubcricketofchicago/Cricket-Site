import { NextResponse } from "next/server";
import { getRecentResults } from "../../lib/data/recentResults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await getRecentResults(6);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { results: [], error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
