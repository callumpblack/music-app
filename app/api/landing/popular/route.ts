import { NextResponse } from "next/server";
import { getLandingData } from "@/lib/popular";

// Public endpoint — the landing page is browseable without an account.
export async function GET() {
  try {
    const data = await getLandingData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("Landing data fetch failed:", err);
    return NextResponse.json({ error: "Could not load popular albums" }, { status: 502 });
  }
}
