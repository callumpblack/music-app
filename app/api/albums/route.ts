import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const genre = params.get("genre");
  const year = params.get("year");
  const rating = params.get("rating");

  let query = getSupabase()
    .from("album_reviews")
    .select("*")
    .eq("user_id", session.userId)
    .order("listened_date", { ascending: false, nullsFirst: false });

  if (genre) query = query.contains("genres", [genre]);
  if (year) query = query.eq("release_year", parseInt(year, 10));
  if (rating) query = query.gte("rating", parseInt(rating, 10));

  const { data, error } = await query;
  if (error) {
    console.error("Album fetch failed:", error);
    return NextResponse.json({ error: "Could not load your albums" }, { status: 500 });
  }
  return NextResponse.json({ albums: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const {
    albumId,
    albumName,
    artistName,
    artistId,
    genres,
    releaseYear,
    coverImageUrl,
    rating,
    reviewText,
    listenedDate,
    spotifyUrl,
    appleMusicUrl,
    bandcampUrl,
  } = body;

  if (!albumId || !albumName || !artistName) {
    return NextResponse.json({ error: "Missing album details" }, { status: 400 });
  }
  if (rating != null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (listenedDate && isNaN(Date.parse(listenedDate))) {
    return NextResponse.json({ error: "Invalid listened date" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("album_reviews")
    .upsert(
      {
        user_id: session.userId,
        album_id: albumId,
        album_name: albumName,
        artist_name: artistName,
        artist_id: artistId ?? null,
        genres: genres ?? [],
        release_year: releaseYear ?? null,
        cover_image_url: coverImageUrl ?? null,
        rating: rating ?? null,
        review_text: reviewText || null,
        listened_date: listenedDate ?? null,
        spotify_url: spotifyUrl ?? null,
        apple_music_url: appleMusicUrl ?? null,
        bandcamp_url: bandcampUrl ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,album_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    console.error("Album save failed:", error);
    return NextResponse.json({ error: "Could not save the album" }, { status: 500 });
  }

  // Cache album metadata for future lookups (best-effort)
  await supabase.from("album_cache").upsert({
    album_id: albumId,
    name: albumName,
    artists: [{ id: artistId ?? null, name: artistName }],
    genres: genres ?? [],
    release_date: releaseYear ? `${releaseYear}-01-01` : null,
    image_url: coverImageUrl ?? null,
    cached_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id: data.id });
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
    .from("album_reviews")
    .delete()
    .eq("user_id", session.userId)
    .eq("album_id", albumId);

  if (error) {
    console.error("Album delete failed:", error);
    return NextResponse.json({ error: "Could not delete the album" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
