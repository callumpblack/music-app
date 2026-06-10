"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Library" },
  { href: "/dashboard/upcoming", label: "Upcoming" },
  { href: "/dashboard/rankings", label: "Rankings" },
];

interface NavbarProps {
  username: string;
  profileImageUrl: string | null;
}

export default function Navbar({ username, profileImageUrl }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (href: string) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
      pathname === href
        ? "bg-primary text-white"
        : "text-ink-soft hover:bg-primary-faint hover:text-primary-soft"
    }`;

  return (
    <header className="fixed top-4 right-4 left-4 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-edge bg-card/90 px-4 py-2 shadow-lg shadow-black/40 backdrop-blur-md sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-xl text-ink">Spinlog</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={`${username}'s avatar`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-faint text-sm font-bold text-primary-soft">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="max-w-32 truncate text-sm font-medium text-ink">{username}</span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="cursor-pointer rounded-full border border-edge px-4 py-1.5 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-primary hover:text-white"
            >
              Log out
            </button>
          </form>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer rounded-full p-2 text-ink transition-colors duration-200 hover:bg-primary-faint md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="animate-fade-up mx-auto mt-2 max-w-7xl rounded-3xl border border-edge bg-card/95 p-4 shadow-lg shadow-black/40 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-edge pt-3">
            <div className="flex items-center gap-2">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={`${username}'s avatar`}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-faint text-sm font-bold text-primary-soft">
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-ink">{username}</span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="cursor-pointer rounded-full border border-edge px-4 py-1.5 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-primary hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
