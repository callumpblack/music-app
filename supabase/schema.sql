-- ============================================================
-- Music App — Supabase schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- NOTE ON AUTH: this app signs users in with Spotify OAuth directly
-- (not Supabase Auth), so auth.uid() is always NULL here. Ownership is
-- enforced server-side in the Next.js API routes, which are the only
-- callers of the database. RLS is enabled with policies scoped to the
-- anon role used by those routes.

-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB
);

-- Table 2: album_reviews
CREATE TABLE IF NOT EXISTS album_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  album_id TEXT NOT NULL,
  album_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_id TEXT,
  genres TEXT[],
  release_year INTEGER,
  cover_image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMP DEFAULT NOW(),
  listened_date DATE,
  spotify_url TEXT,
  apple_music_url TEXT,
  bandcamp_url TEXT,
  bandcamp_tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, album_id)
);

-- Table 3: album_cache
CREATE TABLE IF NOT EXISTS album_cache (
  album_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artists JSONB,
  genres TEXT[],
  release_date DATE,
  image_url TEXT,
  popularity_score INTEGER,
  cached_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  album_id TEXT NOT NULL,
  album_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  genres TEXT[],
  release_date DATE,
  cover_image_url TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, album_id)
);

-- ============================================================
-- Row Level Security
-- Because the app authenticates with Spotify (not Supabase Auth),
-- all DB access goes through the server-side API routes using the
-- anon key. These policies allow that role; per-user isolation is
-- enforced in the API layer (every query filters by user_id from
-- the signed session cookie).
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api access" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "api access" ON album_reviews FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "api access" ON album_cache FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "api access" ON watchlist FOR ALL TO anon USING (true) WITH CHECK (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_album_reviews_user ON album_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
