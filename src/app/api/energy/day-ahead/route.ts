import { NextResponse } from "next/server";
import {
  fetchDayAheadSnapshot,
  type PriceArea,
} from "@/lib/energy/dayAhead";

function parseArea(value: string | null): PriceArea {
  return value === "DK2" ? "DK2" : "DK1";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = parseArea(searchParams.get("area"));

  try {
    const snapshot = await fetchDayAheadSnapshot(area);
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load day-ahead electricity prices." },
      { status: 502 },
    );
  }
}
