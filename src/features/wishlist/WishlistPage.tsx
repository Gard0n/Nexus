import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useJournal } from '@/hooks/useJournal';
import { useToast } from '@/contexts/ToastContext';
import type { MediaType, WishlistItem } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { WishlistItemCard } from './components/WishlistItem';
import { LogMediaModal } from '@/features/journal/components/LogMediaModal';

const MEDIA_TYPES: MediaType[] = ['movie', 'tv', 'book', 'game', 'music'];

export function WishlistPage() {
  const { items, loading, removeItem, removeByMedia } = useWishlist();
  const { addEntry } = useJournal();
  const { showToast } = useToast();
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');

  const filteredItems = filterType === 'all'
    ? items
    : items.filter((item) => item.media.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-nexus-accent animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Wishlist</h2>
        <div className="flex flex-col items-center justify-center py-20 text-nexus-text-muted">
          <Heart size={48} className="mb-4 opacity-40" />
          <p className="text-lg mb-2">Ta wishlist est vide</p>
          <p className="text-sm">Ajoute des œuvres que tu veux découvrir.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Wishlist</h2>
        <p className="text-sm text-nexus-text-muted">
          {items.length} {items.length > 1 ? 'œuvres' : 'œuvre'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-nexus-accent text-white'
              : 'bg-nexus-surface text-nexus-text-muted hover:text-nexus-text'
          }`}
        >
          Tout ({items.length})
        </button>
        {MEDIA_TYPES.map((type) => {
          const config = MEDIA_CONFIG[type];
          const count = items.filter((item) => item.media.type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterType === type
                  ? 'text-white'
                  : 'bg-nexus-surface text-nexus-text-muted hover:text-nexus-text'
              }`}
              style={
                filterType === type
                  ? { backgroundColor: config.color }
                  : undefined
              }
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Items list */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onRemove={(id) => {
                removeItem(id);
                showToast('Retiré de la wishlist');
              }}
              onMarkAsConsumed={(item) => setSelectedItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-nexus-text-muted">
          <p className="text-sm">Aucune œuvre dans cette catégorie</p>
        </div>
      )}

      {/* Log Modal */}
      {selectedItem && (
        <LogMediaModal
          media={selectedItem.media}
          onClose={() => setSelectedItem(null)}
          onSubmit={(data) => {
            addEntry(selectedItem.media, data);
            removeByMedia(selectedItem.media.externalId, selectedItem.media.type);
            showToast(`"${selectedItem.media.title}" ajouté au journal`);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
