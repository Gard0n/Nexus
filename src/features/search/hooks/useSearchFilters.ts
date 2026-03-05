import { useState, useEffect, useMemo } from 'react';
import type { MediaType, NormalizedMedia } from '@/types/media';

export function useSearchFilters(rawResults: NormalizedMedia[], activeTab: MediaType) {
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilterGenre('');
    setFilterYear('');
  }, [activeTab]);

  const availableGenres = useMemo(() => {
    const all = rawResults.flatMap((m) => m.genres);
    return Array.from(new Set(all)).sort();
  }, [rawResults]);

  const activeResults = useMemo(() => {
    return rawResults.filter((m) => {
      if (filterGenre && !m.genres.includes(filterGenre)) return false;
      if (filterYear && m.year !== filterYear) return false;
      return true;
    });
  }, [rawResults, filterGenre, filterYear]);

  const activeFilterCount = [filterGenre, filterYear].filter(Boolean).length;

  function resetFilters() {
    setFilterGenre('');
    setFilterYear('');
  }

  return {
    filterGenre, setFilterGenre,
    filterYear, setFilterYear,
    showFilters, setShowFilters,
    availableGenres,
    activeResults,
    activeFilterCount,
    resetFilters,
  };
}
