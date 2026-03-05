import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useJournal } from '@/hooks/useJournal';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/contexts/ToastContext';
import type { MediaType, NormalizedMedia } from '@/types/media';
import { SearchBar } from './components/SearchBar';
import { SearchTabs } from './components/SearchTabs';
import { SearchFilters } from './components/SearchFilters';
import { SearchResults } from './components/SearchResults';
import { useSearchFilters } from './hooks/useSearchFilters';
import { LogMediaModal } from '@/features/journal/components/LogMediaModal';
import { MediaDetailModal } from '@/components/MediaDetailModal';

const MEDIA_TYPES: MediaType[] = ['movie', 'tv', 'book', 'game', 'music'];

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get('q') ?? '');
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [selectedMedia, setSelectedMedia] = useState<NormalizedMedia | null>(null);
  const [detailMedia, setDetailMedia] = useState<NormalizedMedia | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const currentPage = useRef<Record<MediaType, number>>({
    movie: 1, tv: 1, book: 1, game: 1, music: 1,
  });

  const { loading, error, results, hasMore, search, loadMore } = useSearch();
  const { entries, addEntry, getAllTags } = useJournal();
  const { items, addItem } = useWishlist();
  const { showToast } = useToast();

  const rawResults = results[activeTab] || [];
  const {
    filterGenre, setFilterGenre,
    filterYear, setFilterYear,
    showFilters, setShowFilters,
    availableGenres,
    activeResults,
    activeFilterCount,
    resetFilters,
  } = useSearchFilters(rawResults, activeTab);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      currentPage.current = { movie: 1, tv: 1, book: 1, game: 1, music: 1 };
      search(debouncedQuery);
    }
  }, [debouncedQuery, search]);

  const handleLoadMore = async () => {
    const nextPage = currentPage.current[activeTab] + 1;
    setLoadingMore(true);
    await loadMore(activeTab, debouncedQuery, nextPage);
    currentPage.current[activeTab] = nextPage;
    setLoadingMore(false);
  };

  const totalCount = MEDIA_TYPES.reduce((sum, type) => sum + (results[type]?.length || 0), 0);
  const counts = Object.fromEntries(
    MEDIA_TYPES.map((type) => [type, results[type]?.length || 0])
  ) as Record<MediaType, number>;

  return (
    <div>
      <SearchBar query={query} onChange={setQuery} loading={loading} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {debouncedQuery && totalCount > 0 && (
        <>
          <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          {!loading && rawResults.length > 0 && (
            <SearchFilters
              showFilters={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              filterGenre={filterGenre}
              filterYear={filterYear}
              availableGenres={availableGenres}
              onGenreChange={setFilterGenre}
              onYearChange={setFilterYear}
              onReset={resetFilters}
              activeFilterCount={activeFilterCount}
            />
          )}

          <SearchResults
            loading={loading}
            results={activeResults}
            activeTab={activeTab}
            hasMore={hasMore[activeTab]}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
            onViewDetails={setDetailMedia}
            onAddToJournal={setSelectedMedia}
            onAddToWishlist={(m) => { addItem(m); showToast(`"${m.title}" ajouté à la wishlist`); }}
            isInJournal={(m) => entries.some((e) => e.media.externalId === m.externalId && e.media.type === m.type)}
            isInWishlist={(m) => items.some((i) => i.media.externalId === m.externalId && i.media.type === m.type)}
          />
        </>
      )}

      {!debouncedQuery && (
        <div className="flex flex-col items-center justify-center py-20 text-nexus-text-muted">
          <Search size={48} className="mb-4 opacity-40" />
          <p className="text-lg mb-2">Cherche une œuvre</p>
          <p className="text-sm">Films, séries, livres, jeux, musique</p>
        </div>
      )}

      {detailMedia && (
        <MediaDetailModal
          media={detailMedia}
          onClose={() => setDetailMedia(null)}
          onAddToJournal={(m) => { setDetailMedia(null); setSelectedMedia(m); }}
          onAddToWishlist={(m) => { addItem(m); setDetailMedia(null); showToast(`"${m.title}" ajouté à la wishlist`); }}
        />
      )}

      {selectedMedia && (
        <LogMediaModal
          media={selectedMedia}
          existingTags={getAllTags()}
          onClose={() => setSelectedMedia(null)}
          onSubmit={(data) => {
            addEntry(selectedMedia, data);
            setSelectedMedia(null);
            showToast(`"${selectedMedia.title}" ajouté au journal`);
          }}
        />
      )}
    </div>
  );
}
