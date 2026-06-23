import { NextResponse } from "next/server";
import { getTournamentEntries } from "../../lib/data/tournaments";

// Serves tournament data from the DB in the same shape the CMS used, so the
// existing tournament page renders it unchanged.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTournamentEntries();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { entries: [], error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
