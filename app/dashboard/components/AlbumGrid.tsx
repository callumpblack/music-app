"use client";

import Image from "next/image";
import type { AlbumReview } from "@/lib/types";
import StarRating from "./StarRating";

interface AlbumGridProps {
  albums: AlbumReview[];
  loading: boolean;
  onEdit: (album: AlbumReview) => void;
  onDelete: (album: AlbumReview) => void;
  onAdd: () => void;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-3xl bg-white/10" />
      <div className="mt-3 h-4 w-3/4 rounded-full bg-white/10" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-white/5" />
    </div>
  );
}

export default function AlbumGrid({
  albums,
  loading,
  onEdit,
  onDelete,
  onAdd,
}: AlbumGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="animate-fade-up flex flex-col items-center rounded-3xl border-2 border-dashed border-edge bg-card/40 px-6 py-20 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14 text-primary-soft" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="mt-4 text-lg font-semibold text-ink">No albums yet</p>
        <p className="mt-1 text-ink-soft">Add one to get started!</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 cursor-pointer rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-primary-deep"
        >
          Add your first album
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {albums.map((album) => (
        <div key={album.id} className="group animate-fade-up">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-card shadow-md shadow-black/30 transition-shadow duration-200 group-hover:shadow-xl group-hover:shadow-black/50">
            {album.cover_image_url ? (
              <Image
                src={album.cover_image_url}
                alt={`${album.album_name} by ${album.artist_name}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-primary-soft">
                <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            {/* Hover / focus-within overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              <p className="truncate font-semibold text-white">{album.album_name}</p>
              <p className="truncate text-sm text-white/70">{album.artist_name}</p>
              {album.rating != null && (
                <div className="mt-1">
                  <StarRating value={album.rating} />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(album)}
                  className="cursor-pointer rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-surface transition-colors duration-200 hover:bg-primary hover:text-white"
                >
                  Edit review
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(album)}
                  className="cursor-pointer rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-accent hover:text-surface"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Always-visible caption (mobile has no hover) */}
          <div className="mt-3 sm:hidden">
            <p className="truncate text-sm font-semibold text-ink">{album.album_name}</p>
            <div className="flex items-center justify-between">
              <p className="truncate text-xs text-ink-soft">{album.artist_name}</p>
              <button
                type="button"
                onClick={() => onEdit(album)}
                aria-label={`Edit review for ${album.album_name}`}
                className="cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-primary-soft"
              >
                Edit
              </button>
            </div>
            {album.rating != null && <StarRating value={album.rating} />}
          </div>
        </div>
      ))}
    </div>
  );
}
