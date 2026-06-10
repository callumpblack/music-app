export interface SessionUser {
  userId: string;
  spotifyId: string;
  username: string;
  email: string;
  profileImageUrl: string | null;
  exp: number;
}

export interface AlbumReview {
  id: string;
  user_id: string;
  album_id: string;
  album_name: string;
  artist_name: string;
  artist_id: string | null;
  genres: string[] | null;
  release_year: number | null;
  cover_image_url: string | null;
  rating: number | null;
  review_text: string | null;
  review_date: string;
  listened_date: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  bandcamp_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  albumId: string;
  albumName: string;
  artistName: string;
  artistId: string | null;
  genres: string[];
  releaseYear: number | null;
  coverImageUrl: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  bandcampUrl: string | null;
  platforms: string[];
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  album_id: string;
  album_name: string;
  artist_name: string;
  genres: string[] | null;
  release_date: string | null;
  cover_image_url: string | null;
  added_at: string;
}

export interface UpcomingAlbum {
  id: string;
  albumName: string;
  artistName: string;
  releaseDate: string;
  genres: string[];
  coverImageUrl: string | null;
  spotifyUrl: string | null;
}

export type SortKey = "date" | "rating" | "name" | "year";
