import { NextResponse } from "next/server";
import { getCalendarEntries } from "../../lib/data/schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCalendarEntries();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { entries: [], error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
