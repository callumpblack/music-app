"use client";

const PILL_COLORS = [
  "bg-primary-faint text-primary-soft hover:bg-primary hover:text-white",
  "bg-accent-faint text-accent hover:bg-accent hover:text-surface",
  "bg-mint/15 text-emerald-300 hover:bg-mint hover:text-white",
  "bg-white/10 text-ink hover:bg-white/20",
];

interface TrendingGenresProps {
  genres: { name: string; count: number }[];
  selected: string;
  onSelect: (genre: string) => void;
}

export default function TrendingGenres({ genres, selected, onSelect }: TrendingGenresProps) {
  if (genres.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filter by genre">
      <button
        type="button"
        onClick={() => onSelect("")}
        aria-pressed={selected === ""}
        className={`min-h-11 cursor-pointer rounded-full px-5 text-sm font-semibold transition-colors duration-200 ${
          selected === ""
            ? "bg-ink text-surface"
            : "bg-card text-ink-soft shadow-sm hover:text-ink"
        }`}
      >
        All genres
      </button>
      {genres.map((genre, i) => (
        <button
          key={genre.name}
          type="button"
          onClick={() => onSelect(selected === genre.name ? "" : genre.name)}
          aria-pressed={selected === genre.name}
          className={`min-h-11 cursor-pointer rounded-full px-5 text-sm font-semibold transition-colors duration-200 ${
            selected === genre.name
              ? "bg-ink text-surface"
              : PILL_COLORS[i % PILL_COLORS.length]
          }`}
        >
          {genre.name}
          <span className="ml-1.5 opacity-70">
            ({genre.count} {genre.count === 1 ? "album" : "albums"})
          </span>
        </button>
      ))}
    </div>
  );
}
