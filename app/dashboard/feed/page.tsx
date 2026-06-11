import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { getLandingData } from "@/lib/popular";
import type { AlbumReview } from "@/lib/types";
import CommunityShowcase from "@/app/components/landing/CommunityShowcase";
import AddAlbumLauncher from "../components/AddAlbumLauncher";
import StarRating from "../components/StarRating";

const QUICK_LINKS = [
  { href: "/dashboard", label: "Your library" },
  { href: "/dashboard/upcoming", label: "Upcoming" },
  { href: "/dashboard/rankings", label: "Your rankings" },
];

async function getRecentAlbums(userId: string): Promise<AlbumReview[]> {
  const { data, error } = await getSupabase()
    .from("album_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("listened_date", { ascending: false, nullsFirst: false })
    .limit(5);
  if (error || !data) {
    if (error) console.error("Recent activity fetch failed:", error);
    return [];
  }
  return data as AlbumReview[];
}

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [recent, landing] = await Promise.all([
    getRecentAlbums(session.userId),
    getLandingData().catch((err) => {
      console.error("Landing data unavailable on feed:", err);
      return { albums: [], genres: [] };
    }),
  ]);

  const firstName = session.username.split(" ")[0];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-ink-soft">Here&apos;s what&apos;s happening on Spinlog.</p>
        </div>
        <AddAlbumLauncher />
      </div>

      {/* Quick navigation */}
      <nav aria-label="Quick links" className="mt-6 flex flex-wrap gap-2.5">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="cursor-pointer rounded-full border border-edge bg-card px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:border-primary-soft hover:text-primary-soft"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Your recent activity */}
      {recent.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">Your recent activity</h2>
            <Link
              href="/dashboard"
              className="cursor-pointer text-sm font-semibold text-primary-soft transition-colors duration-200 hover:underline"
            >
              View your library →
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {recent.map((album) => (
              <div key={album.id} className="animate-fade-up">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-card shadow-md shadow-black/30">
                  {album.cover_image_url ? (
                    <Image
                      src={album.cover_image_url}
                      alt={`${album.album_name} by ${album.artist_name}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary-soft">
                      <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-ink">{album.album_name}</p>
                <p className="truncate text-xs text-ink-soft">{album.artist_name}</p>
                {album.rating != null && <StarRating value={album.rating} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* What's popular this week */}
      <div className="mt-12">
        <CommunityShowcase
          albums={landing.albums}
          genres={landing.genres}
          title="What's popular this week"
          subtitle="The albums members are rating right now."
        />
      </div>
    </div>
  );
}
