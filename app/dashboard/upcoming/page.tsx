"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UpcomingAlbum, WatchlistItem } from "@/lib/types";
import Toast, { ToastMessage } from "../components/Toast";

function daysUntil(date: string): number {
  const release = new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00`);
  return Math.ceil((release.getTime() - Date.now()) / 86_400_000);
}

function CountdownBadge({ date }: { date: string }) {
  const days = daysUntil(date);
  const label = days <= 0 ? "Out now" : days === 1 ? "Tomorrow" : `In ${days} days`;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
        days <= 7 ? "bg-accent-faint text-accent" : "bg-primary-faint text-primary-soft"
      }`}
    >
      {label}
    </span>
  );
}

function Cover({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-primary-soft">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cover Art Archive URLs often 404; needs onError fallback
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-xl bg-surface object-cover shadow-sm"
    />
  );
}

export default function UpcomingPage() {
  const [albums, setAlbums] = useState<UpcomingAlbum[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [genreFilter, setGenreFilter] = useState("");
  const [windowFilter, setWindowFilter] = useState<"all" | "month">("all");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [upcomingRes, watchlistRes] = await Promise.all([
        fetch("/api/upcoming"),
        fetch("/api/watchlist"),
      ]);
      const upcoming = await upcomingRes.json();
      if (!upcomingRes.ok) throw new Error(upcoming.error);
      setAlbums(upcoming.albums ?? []);
      if (watchlistRes.ok) {
        const watchlist = await watchlistRes.json();
        setWatchlistIds(
          new Set((watchlist.watchlist as WatchlistItem[]).map((item) => item.album_id))
        );
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const genres = useMemo(
    () => [...new Set(albums.flatMap((album) => album.genres))].sort(),
    [albums]
  );

  const visible = useMemo(
    () =>
      albums.filter((album) => {
        if (genreFilter && !album.genres.includes(genreFilter)) return false;
        if (windowFilter === "month" && daysUntil(album.releaseDate) > 31) return false;
        return true;
      }),
    [albums, genreFilter, windowFilter]
  );

  async function toggleWatchlist(album: UpcomingAlbum) {
    const inList = watchlistIds.has(album.id);
    const next = new Set(watchlistIds);
    if (inList) {
      next.delete(album.id);
      setWatchlistIds(next);
      const res = await fetch(`/api/watchlist?album_id=${encodeURIComponent(album.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setWatchlistIds(watchlistIds);
        setToast({ text: "Could not update your watchlist", kind: "error" });
      }
    } else {
      next.add(album.id);
      setWatchlistIds(next);
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: album.id,
          albumName: album.albumName,
          artistName: album.artistName,
          genres: album.genres,
          releaseDate: album.releaseDate.length === 7 ? `${album.releaseDate}-01` : album.releaseDate,
          coverImageUrl: album.coverImageUrl,
        }),
      });
      if (res.ok) {
        setToast({ text: "Added to your watchlist!", kind: "success" });
      } else {
        setWatchlistIds(watchlistIds);
        setToast({ text: "Could not update your watchlist", kind: "error" });
      }
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Upcoming albums</h1>
      <p className="mt-1 text-ink-soft">
        New releases on the horizon — add them to your watchlist.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="upcoming-genre">
          Filter by genre
        </label>
        <select
          id="upcoming-genre"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="cursor-pointer rounded-full border border-edge bg-card px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors duration-200 hover:border-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft"
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <div className="flex rounded-full border border-edge bg-card p-1 shadow-sm">
          {(["all", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setWindowFilter(option)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                windowFilter === option
                  ? "bg-primary text-white"
                  : "text-ink-soft hover:text-primary-soft"
              }`}
            >
              {option === "all" ? "Next 6 months" : "Next 30 days"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-3xl bg-white/10" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border-2 border-dashed border-edge bg-card/40 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-ink">Could not load upcoming albums</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 cursor-pointer rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-primary-deep"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <ul className="space-y-3">
            {visible.map((album) => {
              const inWatchlist = watchlistIds.has(album.id);
              return (
                <li
                  key={album.id}
                  className="animate-fade-up flex items-center gap-4 rounded-3xl border border-edge bg-card p-3 shadow-sm transition-shadow duration-200 hover:shadow-md hover:shadow-black/40 sm:p-4"
                >
                  <Cover src={album.coverImageUrl} alt={`${album.albumName} cover`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{album.albumName}</p>
                    <p className="truncate text-sm text-ink-soft">{album.artistName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <CountdownBadge date={album.releaseDate} />
                      {album.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="hidden rounded-full bg-primary-faint px-2 py-0.5 text-xs font-medium text-primary-soft sm:inline-block"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <a
                      href={`https://open.spotify.com/search/${encodeURIComponent(
                        `${album.artistName} ${album.albumName}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Find ${album.albumName} on Spotify`}
                      className="cursor-pointer rounded-full p-2 text-[#1DB954] transition-colors duration-200 hover:bg-[#1DB954]/10"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(album)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                        inWatchlist
                          ? "bg-mint/15 text-emerald-300 hover:bg-mint/25"
                          : "bg-accent text-surface shadow-md shadow-black/30 hover:bg-accent-deep"
                      }`}
                    >
                      {inWatchlist ? "On watchlist ✓" : "Watchlist"}
                    </button>
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-3xl border-2 border-dashed border-edge bg-card/40 px-6 py-16 text-center text-ink-soft">
                No upcoming albums match those filters.
              </li>
            )}
          </ul>
        )}
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
