import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You cancelled the Spotify login — try again when you're ready.",
  state_mismatch: "That login link expired — please try again.",
  token_failed: "Spotify rejected the login. Check the app's client ID and secret.",
  not_allowlisted:
    "This Spotify account isn't allowed yet. Add it under 'User Management' in your Spotify Developer Dashboard.",
  profile_failed: "Couldn't read your Spotify profile — please try again.",
  db_failed: "Couldn't save your account. Check the Supabase tables and try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-faint blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-accent-faint blur-3xl"
      />

      <div className="animate-fade-up relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="animate-spin-slow h-11 w-11 text-white"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>

        <h1 className="font-display text-5xl tracking-tight text-ink">Spinlog</h1>
        <p className="mt-4 text-lg text-ink-soft">
          Track your albums. Share your taste.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-primary-faint px-4 py-3 text-sm font-medium text-primary"
          >
            {ERROR_MESSAGES[error] ?? "Login didn't work — please try again."}
          </p>
        )}

        <a
          href="/api/auth/login"
          className="mt-10 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#1DB954] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#1DB954]/30 transition-colors duration-200 hover:bg-[#1aa34a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1DB954]/40"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
          </svg>
          Log in with Spotify
        </a>

        <p className="mt-6 text-sm text-ink-soft">
          Log albums, rate them, and never miss a release.
        </p>
      </div>
    </main>
  );
}
