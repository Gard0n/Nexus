import { useState, useCallback } from 'react';
import type { MediaType, NormalizedMedia } from '@/types/media';
import { searchAll, searchByType } from '@/lib/api/mediaApi';

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<MediaType, NormalizedMedia[]>>({
    movie: [],
    tv: [],
    book: [],
    game: [],
    music: [],
  });
  const [hasMore, setHasMore] = useState<Record<MediaType, boolean>>({
    movie: false,
    tv: false,
    book: false,
    game: false,
    music: false,
  });

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults({ movie: [], tv: [], book: [], game: [], music: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allResults = await searchAll(query);
      const newResults: Record<MediaType, NormalizedMedia[]> = {
        movie: allResults.movie?.results || [],
        tv: allResults.tv?.results || [],
        book: allResults.book?.results || [],
        game: allResults.game?.results || [],
        music: allResults.music?.results || [],
      };
      const newHasMore: Record<MediaType, boolean> = {
        movie: allResults.movie?.hasMore || false,
        tv: allResults.tv?.hasMore || false,
        book: allResults.book?.hasMore || false,
        game: allResults.game?.hasMore || false,
        music: allResults.music?.hasMore || false,
      };

      setResults(newResults);
      setHasMore(newHasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(
    async (type: MediaType, query: string, page: number) => {
      if (!hasMore[type]) return;

      try {
        const moreResults = await searchByType(type, query, page);
        setResults((prev) => ({
          ...prev,
          [type]: [...prev[type], ...moreResults.results],
        }));
        setHasMore((prev) => ({
          ...prev,
          [type]: moreResults.hasMore,
        }));
      } catch (err) {
        console.error(`Load more error for ${type}:`, err);
      }
    },
    [hasMore]
  );

  return { loading, error, results, hasMore, search, loadMore };
}
