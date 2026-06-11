import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSpotifyRedirectUri } from "@/lib/spotify";
import {
  createSessionToken,
  sessionCookieOptions,
  verifyOAuthState,
} from "@/lib/session";

interface SpotifyProfile {
  id: string;
  display_name: string | null;
  email: string;
  images: { url: string }[];
}

/**
 * Base URL from the raw Host header: Next dev normalizes request.url to
 * "localhost", which would strand the browser on the wrong host after the
 * Spotify redirect lands on 127.0.0.1 (where the session cookie lives).
 */
function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "127.0.0.1:3000";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const loginUrl = new URL("/", getBaseUrl(request));

  if (error || !code) {
    loginUrl.searchParams.set("error", error ?? "no_code");
    return NextResponse.redirect(loginUrl);
  }
  if (!state || !verifyOAuthState(state)) {
    console.error("OAuth state invalid or expired");
    loginUrl.searchParams.set("error", "state_mismatch");
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Exchange the authorization code for an access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: getSpotifyRedirectUri(),
      }),
    });
    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokenRes.status, await tokenRes.text());
      loginUrl.searchParams.set("error", "token_failed");
      return NextResponse.redirect(loginUrl);
    }
    const tokens = (await tokenRes.json()) as { access_token: string };

    // Fetch the Spotify profile
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      console.error("Profile fetch failed:", profileRes.status, await profileRes.text());
      // 403 here usually means the Spotify app is in Development Mode and this
      // Spotify account is not on the app's user allowlist
      loginUrl.searchParams.set(
        "error",
        profileRes.status === 403 ? "not_allowlisted" : "profile_failed"
      );
      return NextResponse.redirect(loginUrl);
    }
    const profile = (await profileRes.json()) as SpotifyProfile;

    // Create or update the user in Supabase
    const supabase = getSupabase();
    const { data: user, error: dbError } = await supabase
      .from("users")
      .upsert(
        {
          spotify_id: profile.id,
          email: profile.email ?? "",
          username: profile.display_name ?? profile.id,
          profile_image_url: profile.images?.[0]?.url ?? null,
        },
        { onConflict: "spotify_id" }
      )
      .select("id, spotify_id, email, username, profile_image_url")
      .single();
    if (dbError || !user) {
      console.error("User upsert failed:", dbError);
      loginUrl.searchParams.set("error", "db_failed");
      return NextResponse.redirect(loginUrl);
    }

    const token = createSessionToken({
      userId: user.id,
      spotifyId: user.spotify_id,
      username: user.username ?? user.spotify_id,
      email: user.email,
      profileImageUrl: user.profile_image_url,
    });

    const response = NextResponse.redirect(new URL("/dashboard/feed", getBaseUrl(request)));
    const { name, ...options } = sessionCookieOptions();
    response.cookies.set(name, token, options);
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    loginUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(loginUrl);
  }
}
