import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getLandingData } from "@/lib/popular";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import CommunityShowcase from "./components/landing/CommunityShowcase";
import CTASection from "./components/landing/CTASection";
import Features from "./components/landing/Features";
import Footer from "./components/landing/Footer";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You cancelled the Spotify login — try again when you're ready.",
  state_mismatch: "That login link expired — please try again.",
  token_failed: "Spotify rejected the login. Check the app's client ID and secret.",
  not_allowlisted:
    "This Spotify account isn't allowed yet. Add it under 'User Management' in your Spotify Developer Dashboard.",
  profile_failed: "Couldn't read your Spotify profile — please try again.",
  db_failed: "Couldn't save your account. Check the Supabase tables and try again.",
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard/feed");
  const { error } = await searchParams;

  let landing = { albums: [], genres: [] } as Awaited<ReturnType<typeof getLandingData>>;
  try {
    landing = await getLandingData();
  } catch (err) {
    console.error("Landing data unavailable:", err);
  }

  const heroCovers = landing.albums
    .filter((album) => album.coverImageUrl)
    .slice(0, 6)
    .map((album) => ({
      url: album.coverImageUrl as string,
      alt: `${album.albumName} by ${album.artistName}`,
    }));

  return (
    <div id="top">
      <Header />

      {error && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <p
            role="alert"
            className="rounded-2xl bg-accent-faint px-4 py-3 text-sm font-medium text-accent"
          >
            {ERROR_MESSAGES[error] ?? "Login didn't work — please try again."}
          </p>
        </div>
      )}

      <main>
        <Hero covers={heroCovers} />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <CommunityShowcase albums={landing.albums} genres={landing.genres} />
        </div>
        <CTASection />
        <Features />
      </main>

      <Footer />
    </div>
  );
}
