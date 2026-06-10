import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("watchlist")
    .select("*")
    .eq("user_id", session.userId)
    .order("release_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Watchlist fetch failed:", error);
    return NextResponse.json({ error: "Could not load your watchlist" }, { status: 500 });
  }
  return NextResponse.json({ watchlist: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { albumId, albumName, artistName, genres, releaseDate, coverImageUrl } = body;
  if (!albumId || !albumName || !artistName) {
    return NextResponse.json({ error: "Missing album details" }, { status: 400 });
  }

  const { error } = await getSupabase().from("watchlist").upsert(
    {
      user_id: session.userId,
      album_id: albumId,
      album_name: albumName,
      artist_name: artistName,
      genres: genres ?? [],
      release_date: releaseDate ?? null,
      cover_image_url: coverImageUrl ?? null,
    },
    { onConflict: "user_id,album_id" }
  );

  if (error) {
    console.error("Watchlist add failed:", error);
    return NextResponse.json({ error: "Could not add to watchlist" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const albumId = request.nextUrl.searchParams.get("album_id");
  if (!albumId) {
    return NextResponse.json({ error: "album_id is required" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("watchlist")
    .delete()
    .eq("user_id", session.userId)
    .eq("album_id", albumId);

  if (error) {
    console.error("Watchlist remove failed:", error);
    return NextResponse.json({ error: "Could not remove from watchlist" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
