"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { AlbumReview, SearchResult } from "@/lib/types";
import StarRating from "./StarRating";
import PlatformLinks from "./PlatformLinks";

interface AddAlbumModalProps {
  existing: AlbumReview | null;
  onClose: () => void;
  onSaved: () => void;
}

function reviewToResult(review: AlbumReview): SearchResult {
  return {
    albumId: review.album_id,
    albumName: review.album_name,
    artistName: review.artist_name,
    artistId: review.artist_id,
    genres: review.genres ?? [],
    releaseYear: review.release_year,
    coverImageUrl: review.cover_image_url,
    spotifyUrl: review.spotify_url,
    appleMusicUrl: review.apple_music_url,
    bandcampUrl: review.bandcamp_url,
    platforms: [],
  };
}

const today = () => new Date().toISOString().slice(0, 10);

export default function AddAlbumModal({ existing, onClose, onSaved }: AddAlbumModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(
    existing ? reviewToResult(existing) : null
  );
  const [listenedDate, setListenedDate] = useState(existing?.listened_date ?? today());
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [reviewText, setReviewText] = useState(existing?.review_text ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(res.ok ? (data.results ?? []) : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: selected.albumId,
          albumName: selected.albumName,
          artistName: selected.artistName,
          artistId: selected.artistId,
          genres: selected.genres,
          releaseYear: selected.releaseYear,
          coverImageUrl: selected.coverImageUrl,
          rating: rating || null,
          reviewText,
          listenedDate,
          spotifyUrl: selected.spotifyUrl,
          appleMusicUrl: selected.appleMusicUrl,
          bandcampUrl: selected.bandcampUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the album");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={existing ? "Edit review" : "Add an album"}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-edge bg-card p-6 shadow-2xl shadow-black/50 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">
            {existing ? "Edit review" : "Add an album"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full p-2 text-ink-soft transition-colors duration-200 hover:bg-primary-faint hover:text-primary-soft"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {!existing && (
          <div className="relative mt-5">
            <label htmlFor="album-search" className="text-sm font-semibold text-ink">
              Search for an album
            </label>
            <input
              id="album-search"
              type="text"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Blonde, In Rainbows…"
              className="mt-2 w-full rounded-2xl border border-edge bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft/40"
            />
            {(searching || results.length > 0) && query.trim().length >= 2 && !selected && (
              <ul className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-edge bg-card shadow-xl shadow-black/50">
                {searching && (
                  <li className="px-4 py-3 text-sm text-ink-soft">Searching…</li>
                )}
                {!searching &&
                  results.map((result) => (
                    <li key={result.albumId}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(result);
                          setResults([]);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-primary-faint"
                      >
                        {result.coverImageUrl && (
                          <Image
                            src={result.coverImageUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {result.albumName}
                          </span>
                          <span className="block truncate text-xs text-ink-soft">
                            {result.artistName}
                            {result.releaseYear ? ` · ${result.releaseYear}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                {!searching && results.length === 0 && (
                  <li className="px-4 py-3 text-sm text-ink-soft">No albums found</li>
                )}
              </ul>
            )}
          </div>
        )}

        {selected && (
          <div className="mt-5 flex gap-4 rounded-3xl bg-surface p-4">
            {selected.coverImageUrl && (
              <Image
                src={selected.coverImageUrl}
                alt={`${selected.albumName} cover`}
                width={112}
                height={112}
                className="h-28 w-28 rounded-2xl object-cover shadow-md"
              />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{selected.albumName}</p>
              <p className="truncate text-sm text-ink-soft">
                {selected.artistName}
                {selected.releaseYear ? ` · ${selected.releaseYear}` : ""}
              </p>
              {selected.genres.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selected.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-primary-faint px-2 py-0.5 text-xs font-medium text-primary-soft"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2">
                <PlatformLinks
                  spotifyUrl={selected.spotifyUrl}
                  appleMusicUrl={selected.appleMusicUrl}
                  bandcampUrl={selected.bandcampUrl}
                />
              </div>
              {!existing && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-2 cursor-pointer text-xs font-semibold text-primary-soft hover:underline"
                >
                  Choose a different album
                </button>
              )}
            </div>
          </div>
        )}

        {selected && (
          <div className="mt-5 space-y-5">
            <div>
              <label htmlFor="listened-date" className="text-sm font-semibold text-ink">
                When did you listen?
              </label>
              <input
                id="listened-date"
                type="date"
                value={listenedDate}
                max={today()}
                onChange={(e) => setListenedDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-edge bg-surface px-4 py-3 text-ink [color-scheme:dark] focus:border-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft/40"
              />
            </div>

            <div>
              <span className="text-sm font-semibold text-ink">Your rating</span>
              <div className="mt-2">
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
            </div>

            <div>
              <label htmlFor="review-text" className="text-sm font-semibold text-ink">
                Review <span className="font-normal text-ink-soft">(optional)</span>
              </label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="What did you think?"
                className="mt-2 w-full rounded-2xl border border-edge bg-surface px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft/40"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-2xl bg-accent-faint px-4 py-3 text-sm font-medium text-accent">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full cursor-pointer rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : existing ? "Update review" : "Save to library"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
