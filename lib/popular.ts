import { getSupabase } from "./supabase";
import { searchAlbums } from "./spotify";

export interface PopularAlbum {
  albumId: string;
  albumName: string;
  artistName: string;
  coverImageUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  genres: string[];
  spotifyUrl: string | null;
}

export interface LandingData {
  albums: PopularAlbum[];
  genres: { name: string; count: number }[];
}

// Shown while the community is still small, so the landing page never
// looks empty. Fetched from Spotify and merged after community albums.
const FEATURED: { query: string; genre: string }[] = [
  { query: "To Pimp a Butterfly Kendrick Lamar", genre: "Hip-Hop" },
  { query: "Blonde Frank Ocean", genre: "R&B" },
  { query: "In Rainbows Radiohead", genre: "Alternative" },
  { query: "Rumours Fleetwood Mac", genre: "Rock" },
  { query: "Random Access Memories Daft Punk", genre: "Electronic" },
  { query: "Kind of Blue Miles Davis", genre: "Jazz" },
  { query: "Back to Black Amy Winehouse", genre: "Soul" },
  { query: "Currents Tame Impala", genre: "Psychedelic" },
  { query: "Punisher Phoebe Bridgers", genre: "Indie" },
  { query: "good kid m.A.A.d city Kendrick Lamar", genre: "Hip-Hop" },
  { query: "Norman Fucking Rockwell Lana Del Rey", genre: "Pop" },
  { query: "Vespertine Bjork", genre: "Electronic" },
];

const TARGET_COUNT = 12;
const CACHE_MS = 6 * 60 * 60 * 1000;
let cache: { data: LandingData; fetchedAt: number } | null = null;

async function fetchCommunityAlbums(): Promise<PopularAlbum[]> {
  const { data, error } = await getSupabase()
    .from("album_reviews")
    .select("album_id, album_name, artist_name, cover_image_url, rating, genres, spotify_url");
  if (error || !data) {
    if (error) console.error("Community albums fetch failed:", error);
    return [];
  }

  const grouped = new Map<
    string,
    PopularAlbum & { ratingSum: number; ratingCount: number }
  >();
  for (const review of data) {
    let entry = grouped.get(review.album_id);
    if (!entry) {
      entry = {
        albumId: review.album_id,
        albumName: review.album_name,
        artistName: review.artist_name,
        coverImageUrl: review.cover_image_url,
        avgRating: null,
        reviewCount: 0,
        genres: review.genres ?? [],
        spotifyUrl: review.spotify_url,
        ratingSum: 0,
        ratingCount: 0,
      };
      grouped.set(review.album_id, entry);
    }
    entry.reviewCount += 1;
    if (review.rating != null) {
      entry.ratingSum += review.rating;
      entry.ratingCount += 1;
    }
  }

  return [...grouped.values()]
    .map(({ ratingSum, ratingCount, ...album }) => ({
      ...album,
      avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 20);
}

async function fetchFeaturedAlbums(): Promise<PopularAlbum[]> {
  const results = await Promise.allSettled(
    FEATURED.map(async (entry): Promise<PopularAlbum | null> => {
      const items = await searchAlbums(entry.query, 1);
      const album = items[0];
      if (!album) return null;
      return {
        albumId: album.id,
        albumName: album.name,
        artistName: album.artists[0]?.name ?? "Unknown artist",
        coverImageUrl: album.images[0]?.url ?? null,
        avgRating: null,
        reviewCount: 0,
        genres: [entry.genre],
        spotifyUrl: album.external_urls.spotify,
      };
    })
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<PopularAlbum> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value);
}

export async function getLandingData(): Promise<LandingData> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache.data;

  const community = await fetchCommunityAlbums();
  let albums = community;
  if (albums.length < TARGET_COUNT) {
    try {
      const featured = await fetchFeaturedAlbums();
      const seen = new Set(albums.map((a) => a.albumId));
      albums = [
        ...albums,
        ...featured.filter((a) => !seen.has(a.albumId)),
      ].slice(0, Math.max(TARGET_COUNT, albums.length));
    } catch (err) {
      console.error("Featured albums fetch failed:", err);
    }
  }

  const genreCounts = new Map<string, number>();
  for (const album of albums) {
    for (const genre of album.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }
  const genres = [...genreCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const data: LandingData = { albums, genres };
  cache = { data, fetchedAt: Date.now() };
  return data;
}
