export default function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-rose-100 bg-white px-6 py-14 text-center shadow-lg shadow-rose-100/50 sm:px-12">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">
          Keep track of what you love.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-ink-soft">
          Rate albums, write reviews, and discover music based on your taste.
        </p>
        <a
          href="/api/auth/login"
          className="mt-8 inline-block cursor-pointer rounded-3xl bg-primary px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-rose-700"
        >
          Create your free account
        </a>
        <p className="mt-4 text-sm text-ink-soft">
          We use your Spotify account to set you up in seconds — no new
          passwords to remember.
        </p>
      </div>
    </section>
  );
}
