import { useMemo } from 'react';
import type { JournalEntry, MediaType } from '@/types/media';

export interface CulturalDnaStats {
  totalEntries: number;
  averageRating: number;
  mediaBreakdown: Record<MediaType, number>;
  topGenres: Array<{ genre: string; count: number }>;
  entriesByMonth: Array<{ month: string; count: number }>;
  mostActiveMonth: string;
  favoriteType: MediaType | null;
  ratingDistribution: Record<number, number>;
  topEntries: JournalEntry[];
}

export function useCulturalDna(entries: JournalEntry[]): CulturalDnaStats {
  return useMemo(() => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageRating: 0,
        mediaBreakdown: { movie: 0, tv: 0, book: 0, game: 0, music: 0 },
        topGenres: [],
        entriesByMonth: [],
        mostActiveMonth: '',
        favoriteType: null,
        ratingDistribution: {},
      };
    }

    // Media breakdown
    const mediaBreakdown = entries.reduce((acc, entry) => {
      acc[entry.media.type] = (acc[entry.media.type] || 0) + 1;
      return acc;
    }, {} as Record<MediaType, number>);

    // Favorite type (most logged)
    const favoriteType = Object.entries(mediaBreakdown).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] as MediaType | null;

    // Average rating
    const ratingsSum = entries
      .filter((e) => e.rating !== null)
      .reduce((sum, e) => sum + (e.rating || 0), 0);
    const ratingsCount = entries.filter((e) => e.rating !== null).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    // Rating distribution
    const ratingDistribution = entries
      .filter((e) => e.rating !== null)
      .reduce((acc, entry) => {
        const rating = entry.rating!;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    // Top genres
    const genreCounts = entries.reduce((acc, entry) => {
      entry.media.genres.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([genre, count]) => ({ genre, count }));

    // Entries by month
    const monthCounts = entries.reduce((acc, entry) => {
      const date = new Date(entry.consumedAt);
      const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const entriesByMonth = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .slice(-12); // Last 12 months

    // Most active month
    const mostActiveMonth = Object.entries(monthCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || '';

    // Top entries (by rating)
    const topEntries = entries
      .filter((e) => e.rating !== null)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    return {
      totalEntries: entries.length,
      averageRating: Math.round(averageRating * 10) / 10,
      mediaBreakdown: {
        movie: mediaBreakdown.movie || 0,
        tv: mediaBreakdown.tv || 0,
        book: mediaBreakdown.book || 0,
        game: mediaBreakdown.game || 0,
        music: mediaBreakdown.music || 0,
      },
      topGenres,
      entriesByMonth,
      mostActiveMonth,
      favoriteType,
      ratingDistribution,
      topEntries,
    };
  }, [entries]);
}
