import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useJournal } from '@/hooks/useJournal';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/contexts/ToastContext';
import type { MediaType, NormalizedMedia } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaCard } from './components/MediaCard';
import { LogMediaModal } from '@/features/journal/components/LogMediaModal';

const MEDIA_TYPES: MediaType[] = ['movie', 'tv', 'book', 'game', 'music'];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [selectedMedia, setSelectedMedia] = useState<NormalizedMedia | null>(null);
  const { loading, error, results, search } = useSearch();
  const { addEntry } = useJournal();
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
      search(debouncedQuery);
    }
  }, [debouncedQuery, search]);

  const activeResults = results[activeTab] || [];
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

          {/* Results grid */}
          {activeResults.length > 0 ? (
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
