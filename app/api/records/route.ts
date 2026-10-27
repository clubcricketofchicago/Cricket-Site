import { COMPETITIVE_RESPONSE_HEADERS } from "../../lib/data/cachePolicy";
import { NextResponse } from "next/server";
import { getClubRecords } from "../../lib/data/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = await getClubRecords();
    return NextResponse.json(
      { records },
      {
        headers: {
          ...COMPETITIVE_RESPONSE_HEADERS,
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
