"use client";

const PILL_COLORS = [
  "bg-primary-faint text-primary hover:bg-primary hover:text-white",
  "bg-accent-faint text-accent hover:bg-accent hover:text-white",
  "bg-amber-100 text-amber-700 hover:bg-star hover:text-white",
  "bg-emerald-100 text-emerald-700 hover:bg-mint hover:text-white",
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
            ? "bg-ink text-white"
            : "bg-white text-ink-soft shadow-sm hover:text-ink"
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
              ? "bg-ink text-white"
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
