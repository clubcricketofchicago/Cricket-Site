import { COMPETITIVE_RESPONSE_HEADERS } from "../../lib/data/cachePolicy";
import { NextResponse } from "next/server";
import { getHomeData } from "../../lib/data/home";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomeData();
    return NextResponse.json(data, {
      headers: { ...COMPETITIVE_RESPONSE_HEADERS },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
