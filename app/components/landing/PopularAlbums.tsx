"use client";

import Image from "next/image";
import type { PopularAlbum } from "@/lib/popular";

export default function PopularAlbums({ albums }: { albums: PopularAlbum[] }) {
  if (albums.length === 0) {
    return (
      <p className="rounded-3xl border-2 border-dashed border-edge bg-card/40 px-6 py-12 text-center text-ink-soft">
        No albums in this genre yet — be the first to rate one!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {albums.map((album) => (
        <a
          key={album.albumId}
          href={album.spotifyUrl ?? "/api/auth/login"}
          target={album.spotifyUrl ? "_blank" : undefined}
          rel={album.spotifyUrl ? "noopener noreferrer" : undefined}
          className="group animate-fade-up cursor-pointer"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-card shadow-md shadow-black/30 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/50">
            {album.coverImageUrl ? (
              <Image
                src={album.coverImageUrl}
                alt={`${album.albumName} by ${album.artistName}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
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
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <p className="truncate text-sm font-semibold text-white">{album.albumName}</p>
              <p className="truncate text-xs text-white/70">{album.artistName}</p>
              <p className="mt-0.5 text-xs font-medium text-star">
                {album.avgRating != null
                  ? `${album.avgRating.toFixed(1)}★ from ${album.reviewCount} rating${album.reviewCount === 1 ? "" : "s"}`
                  : "Featured pick"}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
