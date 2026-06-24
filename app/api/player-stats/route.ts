import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId is required" },
        { status: 400 }
      );
    }

    const externalUrl = `https://core-prod-origin.cricclubs.com/core/player/getStats?v=5.0.29&playerId=${playerId}&association=mwcc`;

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "Thunder Client",
        "x-api-key": process.env.X_API_KEY as string,
        "x-consumer-key": process.env.X_CONSUMER_KEY as string,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}