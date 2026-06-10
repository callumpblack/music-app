"use client";

interface PlatformLinksProps {
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  bandcampUrl: string | null;
}

const linkClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200";

export default function PlatformLinks({
  spotifyUrl,
  appleMusicUrl,
  bandcampUrl,
}: PlatformLinksProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {spotifyUrl && (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} bg-[#1DB954]/15 text-[#3ddc78] hover:bg-[#1DB954] hover:text-white`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
          </svg>
          Spotify
        </a>
      )}
      {appleMusicUrl && (
        <a
          href={appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} bg-white/10 text-ink hover:bg-white/90 hover:text-surface`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M9 18.5a2.5 2.5 0 1 1-1.5-2.29V6.6a1 1 0 0 1 .77-.97l9-2.25A1 1 0 0 1 18.5 4.5v10a2.5 2.5 0 1 1-1.5-2.29V7.28l-8 2V18.5z" />
          </svg>
          Apple Music
        </a>
      )}
      {bandcampUrl && (
        <a
          href={bandcampUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} bg-[#1da0c3]/15 text-[#5cc8e6] hover:bg-[#1da0c3] hover:text-white`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z" />
          </svg>
          Bandcamp
        </a>
      )}
    </div>
  );
}
