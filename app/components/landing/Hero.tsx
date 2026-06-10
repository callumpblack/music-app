"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface HeroCover {
  url: string;
  alt: string;
}

// Fixed artful arrangement for the stacked covers (back to front)
const SLOTS = [
  "translate-x-16 -translate-y-6 rotate-6 scale-90 opacity-60",
  "-translate-x-16 translate-y-4 -rotate-6 scale-90 opacity-60",
  "translate-x-6 translate-y-10 rotate-3 scale-95 opacity-80",
  "translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100",
];

export default function Hero({ covers }: { covers: HeroCover[] }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (covers.length < 2) return;
    const timer = setInterval(() => {
      setOffset((current) => (current + 1) % covers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [covers.length]);

  const visible = SLOTS.map(
    (_, i) => covers[(offset + i) % Math.max(covers.length, 1)]
  );

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
          Track the albums you{" "}
          <span className="text-accent">love</span>.
        </h1>
        <p className="mt-5 max-w-md text-lg text-ink-soft">
          See what members are rating. Discover new music. Never miss a
          release.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/api/auth/login"
            className="cursor-pointer rounded-3xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-primary-deep"
          >
            Get started — it&apos;s free
          </a>
          <a
            href="/api/auth/login"
            className="cursor-pointer rounded-3xl border-2 border-edge px-6 py-3.5 font-semibold text-ink transition-colors duration-200 hover:border-primary-soft hover:text-primary-soft"
          >
            Log in with Spotify
          </a>
        </div>
        <a
          href="#popular"
          className="mt-5 inline-block cursor-pointer text-sm font-medium text-ink-soft underline-offset-4 transition-colors duration-200 hover:text-primary-soft hover:underline"
        >
          Or browse without signing up
        </a>
      </div>

      {covers.length > 0 && (
        <div
          className="relative mx-auto h-72 w-72 sm:h-96 sm:w-96"
          aria-label="A rotating collection of popular album covers"
        >
          {visible.map((cover, i) =>
            cover ? (
              <div
                key={`${cover.url}-${i}`}
                className={`absolute inset-0 transition-all duration-700 ease-out ${SLOTS[i]}`}
              >
                <Image
                  src={cover.url}
                  alt={i === SLOTS.length - 1 ? cover.alt : ""}
                  fill
                  sizes="(max-width: 640px) 288px, 384px"
                  className="rounded-3xl object-cover shadow-2xl shadow-black/50"
                  priority={i === SLOTS.length - 1}
                />
              </div>
            ) : null
          )}
        </div>
      )}
    </section>
  );
}
