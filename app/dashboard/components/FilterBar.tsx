"use client";

import type { SortKey } from "@/lib/types";

export interface Filters {
  genre: string;
  year: string;
  sort: SortKey;
}

interface FilterBarProps {
  filters: Filters;
  genres: string[];
  years: number[];
  resultCount: number;
  onChange: (filters: Filters) => void;
}

const selectClass =
  "cursor-pointer rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors duration-200 hover:border-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function FilterBar({
  filters,
  genres,
  years,
  resultCount,
  onChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="genre-filter">
        Filter by genre
      </label>
      <select
        id="genre-filter"
        value={filters.genre}
        onChange={(e) => onChange({ ...filters, genre: e.target.value })}
        className={selectClass}
      >
        <option value="">All genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="year-filter">
        Filter by year
      </label>
      <select
        id="year-filter"
        value={filters.year}
        onChange={(e) => onChange({ ...filters, year: e.target.value })}
        className={selectClass}
      >
        <option value="">All years</option>
        {years.map((year) => (
          <option key={year} value={String(year)}>
            {year}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="sort-order">
        Sort albums
      </label>
      <select
        id="sort-order"
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
        className={selectClass}
      >
        <option value="date">Recently listened</option>
        <option value="rating">Highest rated</option>
        <option value="name">Album name</option>
        <option value="year">Release year</option>
      </select>

      <span className="ml-auto rounded-full bg-accent-faint px-3 py-1 text-sm font-semibold text-accent">
        {resultCount} {resultCount === 1 ? "album" : "albums"}
      </span>
    </div>
  );
}
