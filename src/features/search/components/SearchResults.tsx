import { Loader2 } from 'lucide-react';
import type { MediaType, NormalizedMedia } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaCard } from './MediaCard';
import { SearchSkeleton } from '@/components/SearchSkeleton';

interface Props {
  loading: boolean;
  results: NormalizedMedia[];
  activeTab: MediaType;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onViewDetails: (m: NormalizedMedia) => void;
  onAddToJournal: (m: NormalizedMedia) => void;
  onAddToWishlist: (m: NormalizedMedia) => void;
  isInJournal: (m: NormalizedMedia) => boolean;
  isInWishlist: (m: NormalizedMedia) => boolean;
}

export function SearchResults({
  loading,
  results,
  activeTab,
  hasMore,
  loadingMore,
  onLoadMore,
  onViewDetails,
  onAddToJournal,
  onAddToWishlist,
  isInJournal,
  isInWishlist,
}: Props) {
  if (loading) return <SearchSkeleton />;

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-nexus-text-muted">
        <p className="text-sm">
          Aucun résultat pour {MEDIA_CONFIG[activeTab].label.toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((media) => (
          <MediaCard
            key={`${media.type}-${media.externalId}`}
            media={media}
            onViewDetails={onViewDetails}
            onAddToJournal={onAddToJournal}
            onAddToWishlist={onAddToWishlist}
            isInJournal={isInJournal(media)}
            isInWishlist={isInWishlist(media)}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2 bg-nexus-surface border border-nexus-border rounded-lg text-sm font-medium hover:border-nexus-accent transition-colors disabled:opacity-50"
          >
            {loadingMore && <Loader2 size={16} className="animate-spin" />}
            {loadingMore ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      )}
    </>
  );
}
