export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-surface/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-xl text-ink">Spinlog</span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="#popular"
            className="hidden cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-primary-soft sm:inline-block"
          >
            Browse
          </a>
          <a
            href="/api/auth/login"
            className="cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-black/30 transition-colors duration-200 hover:bg-primary-deep"
          >
            Log in with Spotify
          </a>
        </div>
      </nav>
    </header>
  );
}
