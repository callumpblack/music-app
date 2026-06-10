import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { UpcomingAlbum } from "@/lib/types";

// Upcoming releases come from the MusicBrainz API (free, no key needed).
// Cover art is resolved client-side via the Cover Art Archive.

interface MusicBrainzReleaseGroup {
  id: string;
  title: string;
  "first-release-date"?: string;
  "artist-credit"?: { name: string }[];
  tags?: { name: string; count: number }[];
}

let cache: { data: UpcomingAlbum[]; fetchedAt: number } | null = null;
const CACHE_MS = 60 * 60 * 1000;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function fetchUpcoming(): Promise<UpcomingAlbum[]> {
  const today = new Date();
  const horizon = new Date(today);
  horizon.setMonth(horizon.getMonth() + 6);

  const query = `firstreleasedate:[${formatDate(today)} TO ${formatDate(horizon)}] AND primarytype:Album AND status:Official`;
  const res = await fetch(
    `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=60`,
    {
      headers: { "User-Agent": "MusicApp/1.0 (album tracker)" },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) throw new Error(`MusicBrainz request failed: ${res.status}`);
  const data = (await res.json()) as { "release-groups": MusicBrainzReleaseGroup[] };

  return (data["release-groups"] ?? [])
    .filter((group) => (group["first-release-date"] ?? "").length >= 7)
    .map((group) => ({
      id: group.id,
      albumName: group.title,
      artistName: group["artist-credit"]?.map((credit) => credit.name).join(", ") ?? "Unknown artist",
      releaseDate: group["first-release-date"] as string,
      genres: (group.tags ?? [])
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((tag) => tag.name),
      coverImageUrl: `https://coverartarchive.org/release-group/${group.id}/front-250`,
      spotifyUrl: null,
    }))
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return NextResponse.json({ albums: cache.data });
  }

  try {
    const albums = await fetchUpcoming();
    cache = { data: albums, fetchedAt: Date.now() };
    return NextResponse.json({ albums });
  } catch (err) {
    console.error("Upcoming albums fetch failed:", err);
    return NextResponse.json(
      { error: "Could not load upcoming albums" },
      { status: 502 }
    );
  }
}
