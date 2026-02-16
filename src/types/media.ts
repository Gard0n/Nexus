export type MediaType = 'movie' | 'tv' | 'book' | 'game' | 'music';

export interface NormalizedMedia {
  externalId: string;
  type: MediaType;
  title: string;
  year: string | null;
  posterUrl: string | null;
  genres: string[];
  metadata: Record<string, unknown>;
}

export interface JournalEntry {
  id: string;
  userId: string;
  media: NormalizedMedia;
  consumedAt: string; // ISO date string (YYYY-MM-DD)
  rating: number | null; // 1-10
  note: string;
  tags: string[];
  isRewatch: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  media: NormalizedMedia;
  priority: number;
  addedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MEDIA_CONFIG: Record<MediaType, { label: string; color: string; verb: string }> = {
  movie: { label: 'Film', color: 'var(--color-media-movie)', verb: 'Vu' },
  tv: { label: 'Série', color: 'var(--color-media-tv)', verb: 'Vu' },
  book: { label: 'Livre', color: 'var(--color-media-book)', verb: 'Lu' },
  game: { label: 'Jeu', color: 'var(--color-media-game)', verb: 'Joué' },
  music: { label: 'Musique', color: 'var(--color-media-music)', verb: 'Écouté' },
};
