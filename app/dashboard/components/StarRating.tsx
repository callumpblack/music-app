"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "lg";
}

export default function StarRating({ value, onChange, size = "sm" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const interactive = Boolean(onChange);
  const starClass = size === "lg" ? "h-9 w-9" : "h-4 w-4";

  return (
    <div
      className="flex items-center gap-1"
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Rating" : `Rated ${value} out of 5 stars`}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        const StarSvg = (
          <svg
            viewBox="0 0 24 24"
            className={`${starClass} transition-colors duration-150 ${
              filled ? "text-star" : "text-gray-300"
            } ${interactive && filled && hovered === 0 && star === value ? "animate-pop" : ""}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.92 6.26 6.58.84-4.84 4.7 1.24 6.53L12 17.1l-5.9 3.23 1.24-6.53-4.84-4.7 6.58-.84L12 2z" />
          </svg>
        );
        if (!interactive) return <span key={star}>{StarSvg}</span>;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className="cursor-pointer rounded-lg p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-star"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange?.(star)}
          >
            {StarSvg}
          </button>
        );
      })}
    </div>
  );
}
