"use client";

import { useMemo, useState } from "react";
import type { PopularAlbum } from "@/lib/popular";
import PopularAlbums from "./PopularAlbums";
import TrendingGenres from "./TrendingGenres";

interface CommunityShowcaseProps {
  albums: PopularAlbum[];
  genres: { name: string; count: number }[];
  title?: string;
  subtitle?: string;
}

export default function CommunityShowcase({
  albums,
  genres,
  title = "What members are rating",
  subtitle = "See what's trending in the community — no account needed to look around.",
}: CommunityShowcaseProps) {
  const [selectedGenre, setSelectedGenre] = useState("");

  const visible = useMemo(
    () =>
      selectedGenre
        ? albums.filter((album) => album.genres.includes(selectedGenre))
        : albums,
    [albums, selectedGenre]
  );

  return (
    <section id="popular" className="scroll-mt-28">
      <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
      <p className="mt-2 text-lg text-ink-soft">{subtitle}</p>

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
