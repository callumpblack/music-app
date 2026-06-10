const FEATURES = [
  {
    title: "Rate & review",
    description: "Share your opinion on every album you spin, from 1 to 5 stars.",
    color: "bg-primary-faint text-primary",
    icon: (
      <path d="M12 2l2.92 6.26 6.58.84-4.84 4.7 1.24 6.53L12 17.1l-5.9 3.23 1.24-6.53-4.84-4.7 6.58-.84L12 2z" />
    ),
  },
  {
    title: "Keep a watchlist",
    description: "Save upcoming releases so you never miss the albums you're waiting for.",
    color: "bg-accent-faint text-accent",
    icon: (
      <path d="M12 21s-7.5-4.8-9.5-9A5.5 5.5 0 0 1 12 6.6 5.5 5.5 0 0 1 21.5 12c-2 4.2-9.5 9-9.5 9z" />
    ),
  },
  {
    title: "Build your library",
    description: "Your listening history, organized by genre, year, and rating.",
    color: "bg-amber-100 text-amber-600",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),
  },
  {
    title: "See your taste",
    description: "Rankings and stats that show what you really listen to.",
    color: "bg-emerald-100 text-emerald-600",
    icon: (
      <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" strokeLinecap="round" />
    ),
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-3xl text-ink sm:text-4xl">
        Why join Spinlog?
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                {feature.icon}
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
