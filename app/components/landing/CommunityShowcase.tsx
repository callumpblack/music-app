"use client";

import { useMemo, useState } from "react";
import type { PopularAlbum } from "@/lib/popular";
import PopularAlbums from "./PopularAlbums";
import TrendingGenres from "./TrendingGenres";

interface CommunityShowcaseProps {
  albums: PopularAlbum[];
  genres: { name: string; count: number }[];
}

export default function CommunityShowcase({ albums, genres }: CommunityShowcaseProps) {
  const [selectedGenre, setSelectedGenre] = useState("");

  const visible = useMemo(
    () =>
      selectedGenre
        ? albums.filter((album) => album.genres.includes(selectedGenre))
        : albums,
    [albums, selectedGenre]
  );

  return (
    <section id="popular" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl text-ink sm:text-4xl">
        What members are rating
      </h2>
      <p className="mt-2 text-lg text-ink-soft">
        See what&apos;s trending in the community — no account needed to look around.
      </p>

      <div className="mt-8">
        <h3 className="sr-only">Discover by genre</h3>
        <TrendingGenres
          genres={genres}
          selected={selectedGenre}
          onSelect={setSelectedGenre}
        />
      </div>

      <div className="mt-8">
        <PopularAlbums albums={visible} />
      </div>
    </section>
  );
}
