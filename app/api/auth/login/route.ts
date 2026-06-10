import { NextResponse } from "next/server";
import { createOAuthState } from "@/lib/session";
import { getSpotifyRedirectUri } from "@/lib/spotify";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = getSpotifyRedirectUri();
  if (!clientId) {
    return NextResponse.json({ error: "Spotify is not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "user-read-email user-read-private",
    redirect_uri: redirectUri,
    state: createOAuthState(),
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
