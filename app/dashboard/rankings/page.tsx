"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { AlbumReview } from "@/lib/types";
import StarRating from "../components/StarRating";

export default function RankingsPage() {
  const [albums, setAlbums] = useState<AlbumReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/albums")
      .then((res) => res.json())
      .then((data) => setAlbums(data.albums ?? []))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const rated = albums.filter((album) => album.rating != null);
    const genreCounts = new Map<string, number>();
    for (const album of albums) {
      for (const genre of album.genres ?? []) {
        genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
      }
    }
    const topGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      total: albums.length,
      averageRating: rated.length
        ? (rated.reduce((sum, album) => sum + (album.rating ?? 0), 0) / rated.length).toFixed(1)
        : "—",
      topGenre: topGenres[0]?.[0] ?? "—",
      topGenres,
      topRated: [...rated].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 8),
    };
  }, [albums]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-full bg-rose-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-rose-100/70" />
          ))}
        </div>
      </div>
    );
  }

  const maxGenreCount = stats.topGenres[0]?.[1] ?? 1;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Your rankings</h1>
      <p className="mt-1 text-ink-soft">A snapshot of your taste so far.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink-soft">Albums logged</p>
          <p className="font-display mt-2 text-4xl text-primary">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink-soft">Average rating</p>
          <p className="font-display mt-2 text-4xl text-star">{stats.averageRating}</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink-soft">Top genre</p>
          <p className="font-display mt-2 truncate text-4xl text-accent">{stats.topGenre}</p>
        </div>
      </div>

      {stats.topGenres.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl text-ink">Genre breakdown</h2>
          <div className="mt-4 space-y-3 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            {stats.topGenres.map(([genre, count]) => (
              <div key={genre}>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-ink">{genre}</span>
                  <span className="text-ink-soft">{count}</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-rose-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-soft to-primary transition-[width] duration-500"
                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.topRated.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl text-ink">Your top-rated albums</h2>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {stats.topRated.map((album) => (
              <div key={album.id} className="animate-fade-up">
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-rose-100 shadow-md">
                  {album.cover_image_url && (
                    <Image
                      src={album.cover_image_url}
                      alt={`${album.album_name} by ${album.artist_name}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
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

      {stats.total === 0 && (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center text-ink-soft">
          Log a few albums and your stats will show up here.
        </div>
      )}
    </div>
  );
}
