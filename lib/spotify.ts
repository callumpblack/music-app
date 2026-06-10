// Server-side Spotify Web API helpers using the client-credentials flow
// (app-level token, used for search and browse endpoints).

interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: SpotifyImage[];
  artists: { id: string; name: string }[];
  external_urls: { spotify: string };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getAppToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Spotify credentials are not set");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token request failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getAppToken();
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify API error ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

export async function searchAlbums(query: string, limit = 8): Promise<SpotifyAlbum[]> {
  const data = await spotifyGet<{ albums: { items: SpotifyAlbum[] } }>(
    `/search?type=album&limit=${limit}&q=${encodeURIComponent(query)}`
  );
  return data.albums.items;
}

