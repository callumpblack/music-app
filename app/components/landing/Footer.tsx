const LINKS = [
  { label: "About", href: "#top" },
  { label: "Browse", href: "#popular" },
  { label: "Contact", href: "mailto:hello@spinlog.app" },
];

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-sm font-medium text-ink-soft">
            © 2026 Spinlog. Track your albums.
          </span>
        </div>
        <nav className="flex gap-6" aria-label="Footer">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="cursor-pointer text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-primary-soft"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
