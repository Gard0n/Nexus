import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useJournal } from '@/hooks/useJournal';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/contexts/ToastContext';
import type { MediaType, NormalizedMedia } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaCard } from './components/MediaCard';
import { LogMediaModal } from '@/features/journal/components/LogMediaModal';
import { SearchSkeleton } from '@/components/SearchSkeleton';

const MEDIA_TYPES: MediaType[] = ['movie', 'tv', 'book', 'game', 'music'];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [selectedMedia, setSelectedMedia] = useState<NormalizedMedia | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const currentPage = useRef<Record<MediaType, number>>({
    movie: 1, tv: 1, book: 1, game: 1, music: 1,
  });
  const { loading, error, results, hasMore, search, loadMore } = useSearch();
  const { addEntry, getAllTags } = useJournal();
  const { addItem } = useWishlist();
  const { showToast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      currentPage.current = { movie: 1, tv: 1, book: 1, game: 1, music: 1 };
      setFilterGenre('');
      setFilterYear('');
      search(debouncedQuery);
    }
  }, [debouncedQuery, search]);

  // Reset filters on tab change
  useEffect(() => {
    setFilterGenre('');
    setFilterYear('');
  }, [activeTab]);

  const handleLoadMore = async () => {
    const nextPage = currentPage.current[activeTab] + 1;
    setLoadingMore(true);
    await loadMore(activeTab, debouncedQuery, nextPage);
    currentPage.current[activeTab] = nextPage;
    setLoadingMore(false);
  };

  const rawResults = results[activeTab] || [];

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

  const totalCount = MEDIA_TYPES.reduce((sum, type) => sum + (results[type]?.length || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Recherche</h2>

        {/* Search bar */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un film, série, livre, jeu, album..."
            className="w-full pl-12 pr-4 py-3 bg-nexus-surface border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text placeholder:text-nexus-text-muted"
          />
          {loading && (
            <Loader2
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-nexus-accent animate-spin"
            />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {debouncedQuery && totalCount > 0 && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {MEDIA_TYPES.map((type) => {
              const config = MEDIA_CONFIG[type];
              const count = results[type]?.length || 0;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                    activeTab === type
                      ? 'bg-nexus-accent text-white'
                      : 'bg-nexus-surface text-nexus-text-muted hover:text-nexus-text'
                  }`}
                  style={
                    activeTab === type
                      ? { backgroundColor: config.color }
                      : undefined
                  }
                >
                  {config.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === type
                        ? 'bg-white/20'
                        : 'bg-nexus-bg'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Advanced filters */}
          {!loading && rawResults.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  showFilters || filterGenre || filterYear
                    ? 'border-nexus-accent text-nexus-accent'
                    : 'border-nexus-border text-nexus-text-muted hover:border-nexus-accent hover:text-nexus-accent'
                }`}
              >
                <SlidersHorizontal size={14} />
                Filtrer
                {(filterGenre || filterYear) && (
                  <span className="bg-nexus-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[filterGenre, filterYear].filter(Boolean).length}
                  </span>
                )}
              </button>
              {showFilters && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {availableGenres.length > 0 && (
                    <select
                      value={filterGenre}
                      onChange={(e) => setFilterGenre(e.target.value)}
                      className="px-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent"
                    >
                      <option value="">Tous les genres</option>
                      {availableGenres.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    placeholder="Année"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-24 px-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent placeholder:text-nexus-text-muted"
                  />
                  {(filterGenre || filterYear) && (
                    <button
                      onClick={() => { setFilterGenre(''); setFilterYear(''); }}
                      className="text-sm text-nexus-text-muted hover:text-nexus-accent transition-colors"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <SearchSkeleton />
          ) : activeResults.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeResults.map((media) => (
                  <MediaCard
                    key={`${media.type}-${media.externalId}`}
                    media={media}
                    onAddToJournal={(m) => setSelectedMedia(m)}
                    onAddToWishlist={(m) => {
                      addItem(m);
                      showToast(`"${m.title}" ajouté à la wishlist`);
                    }}
                  />
                ))}
              </div>
              {hasMore[activeTab] && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-2 bg-nexus-surface border border-nexus-border rounded-lg text-sm font-medium hover:border-nexus-accent transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}
                    {loadingMore ? 'Chargement...' : 'Voir plus'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-nexus-text-muted">
              <p className="text-sm">Aucun résultat pour {MEDIA_CONFIG[activeTab].label.toLowerCase()}</p>
            </div>
          )}
        </>
      )}

      {!debouncedQuery && (
        <div className="flex flex-col items-center justify-center py-20 text-nexus-text-muted">
          <Search size={48} className="mb-4 opacity-40" />
          <p className="text-lg mb-2">Cherche une œuvre</p>
          <p className="text-sm">Films, séries, livres, jeux, musique</p>
        </div>
      )}

      {/* Log Modal */}
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
