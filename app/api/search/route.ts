import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { searchAlbums } from "@/lib/spotify";
import type { SearchResult } from "@/lib/types";

/** Normalize names so results from different platforms can be matched up. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface ItunesAlbum {
  collectionName: string;
  artistName: string;
  collectionViewUrl: string;
  primaryGenreName?: string;
}

async function searchItunes(query: string): Promise<ItunesAlbum[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=25`,
    { signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
  const data = (await res.json()) as { results: ItunesAlbum[] };
  return data.results ?? [];
}

interface BandcampResult {
  name: string;
  artist: string;
  url: string;
}

async function searchBandcamp(query: string): Promise<BandcampResult[]> {
  const res = await fetch(
    `https://bandcamp.com/search?q=${encodeURIComponent(query)}&item_type=a`,
    {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MusicApp/1.0)" },
      signal: AbortSignal.timeout(5000),
    }
  );
  if (!res.ok) throw new Error(`Bandcamp search failed: ${res.status}`);
  const html = await res.text();

  // Each search result block contains an itemurl link, a heading and a subhead
  const results: BandcampResult[] = [];
  const blocks = html.split('class="searchresult').slice(1, 11);
  for (const block of blocks) {
    const url = block.match(/class="itemurl">\s*<a href="([^"?]+)/)?.[1];
    const heading = block.match(/class="heading">\s*<a[^>]*>\s*([^<]+?)\s*</)?.[1];
    const subhead = block.match(/class="subhead">\s*([\s\S]*?)\s*</)?.[1];
    if (url && heading) {
      results.push({
        name: heading.trim(),
        artist: (subhead ?? "").replace(/^by\s+/i, "").trim(),
        url,
      });
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // Search all platforms in parallel; any single failure is non-fatal
  const [spotifyRes, itunesRes, bandcampRes] = await Promise.allSettled([
    searchAlbums(query),
    searchItunes(query),
    searchBandcamp(query),
  ]);

  if (spotifyRes.status === "rejected") {
    console.error("Spotify search failed:", spotifyRes.reason);
    return NextResponse.json({ error: "Search is unavailable right now" }, { status: 502 });
  }

  const itunes = itunesRes.status === "fulfilled" ? itunesRes.value : [];
  const bandcamp = bandcampRes.status === "fulfilled" ? bandcampRes.value : [];

  const seen = new Set<string>();
  const results: SearchResult[] = [];
  for (const album of spotifyRes.value) {
    const artist = album.artists[0];
    const key = `${normalize(album.name)}|${normalize(artist?.name ?? "")}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const appleMatch = itunes.find(
      (item) =>
        normalize(item.collectionName).includes(normalize(album.name)) &&
        normalize(item.artistName) === normalize(artist?.name ?? "")
    );
    const bandcampMatch = bandcamp.find(
      (item) =>
        normalize(item.name).includes(normalize(album.name)) ||
        normalize(album.name).includes(normalize(item.name))
    );

    const platforms = ["spotify"];
    if (appleMatch) platforms.push("apple");
    if (bandcampMatch) platforms.push("bandcamp");

    results.push({
      albumId: album.id,
      albumName: album.name,
      artistName: artist?.name ?? "Unknown artist",
      artistId: artist?.id ?? null,
      // Spotify no longer exposes genres, so take them from the iTunes match
      genres: appleMatch?.primaryGenreName ? [appleMatch.primaryGenreName] : [],
      releaseYear: album.release_date
        ? parseInt(album.release_date.slice(0, 4), 10)
        : null,
      coverImageUrl: album.images[0]?.url ?? null,
      spotifyUrl: album.external_urls.spotify,
      appleMusicUrl: appleMatch?.collectionViewUrl ?? null,
      bandcampUrl: bandcampMatch?.url ?? null,
      platforms,
    });
  }

  return NextResponse.json({ results });
}
