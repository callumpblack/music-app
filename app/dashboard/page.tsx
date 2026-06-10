"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AlbumReview } from "@/lib/types";
import AlbumGrid from "./components/AlbumGrid";
import AddAlbumModal from "./components/AddAlbumModal";
import FilterBar, { Filters } from "./components/FilterBar";
import Toast, { ToastMessage } from "./components/Toast";

export default function DashboardPage() {
  const [albums, setAlbums] = useState<AlbumReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ genre: "", year: "", sort: "date" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AlbumReview | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.genre) params.set("genre", filters.genre);
      if (filters.year) params.set("year", filters.year);
      const res = await fetch(`/api/albums?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlbums(data.albums ?? []);
    } catch {
      setToast({ text: "Could not load your albums", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters.genre, filters.year]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const sortedAlbums = useMemo(() => {
    const list = [...albums];
    switch (filters.sort) {
      case "rating":
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "name":
        return list.sort((a, b) => a.album_name.localeCompare(b.album_name));
      case "year":
        return list.sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0));
      default:
        return list; // API already sorts by listened_date desc
    }
  }, [albums, filters.sort]);

  // Build filter options from the unfiltered dimension of the data
  const genres = useMemo(
    () => [...new Set(albums.flatMap((album) => album.genres ?? []))].sort(),
    [albums]
  );
  const years = useMemo(
    () =>
      [...new Set(albums.map((album) => album.release_year).filter((y): y is number => y != null))].sort(
        (a, b) => b - a
      ),
    [albums]
  );

  async function handleDelete(album: AlbumReview) {
    if (!confirm(`Remove "${album.album_name}" from your library?`)) return;
    const res = await fetch(`/api/albums?album_id=${encodeURIComponent(album.album_id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAlbums((current) => current.filter((a) => a.id !== album.id));
      setToast({ text: "Album removed", kind: "success" });
    } else {
      setToast({ text: "Could not delete the album", kind: "error" });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Your library</h1>
          <p className="mt-1 text-ink-soft">Every album you&apos;ve logged, in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-primary-deep"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Add album
        </button>
      </div>

      <div className="mt-8">
        <FilterBar
          filters={filters}
          genres={genres}
          years={years}
          resultCount={sortedAlbums.length}
          onChange={setFilters}
        />
      </div>

      <div className="mt-6">
        <AlbumGrid
          albums={sortedAlbums}
          loading={loading}
          onEdit={(album) => {
            setEditTarget(album);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
        />
      </div>

      {modalOpen && (
        <AddAlbumModal
          existing={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            setToast({
              text: editTarget ? "Review updated!" : "Album added to your library!",
              kind: "success",
            });
            fetchAlbums();
          }}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
