import { useState, useEffect, useCallback } from 'react';
import type { WishlistItem, NormalizedMedia } from '@/types/media';
import { wishlistService } from '@/lib/localStorage/wishlist.service';

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    setLoading(true);
    const data = wishlistService.list();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = useCallback((media: NormalizedMedia, priority = 0) => {
    const newItem = wishlistService.add(media, priority);
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const removeItem = useCallback((id: string) => {
    const success = wishlistService.remove(id);
    if (success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    return success;
  }, []);

  const removeByMedia = useCallback((externalId: string, type: string) => {
    const success = wishlistService.removeByMedia(externalId, type);
    if (success) {
      setItems((prev) =>
        prev.filter(
          (item) => !(item.media.externalId === externalId && item.media.type === type)
        )
      );
    }
    return success;
  }, []);

  const isInWishlist = useCallback((externalId: string, type: string) => {
    return wishlistService.isInWishlist(externalId, type);
  }, []);

  const updatePriority = useCallback((id: string, priority: number) => {
    const updated = wishlistService.updatePriority(id, priority);
    if (updated) {
      setItems((prev) =>
        [...prev.map((item) => (item.id === id ? updated : item))].sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        })
      );
    }
    return updated;
  }, []);

  const filterByType = useCallback((type: string) => {
    return wishlistService.filterByType(type);
  }, []);

  return {
    items,
    loading,
    addItem,
    removeItem,
    removeByMedia,
    updatePriority,
    isInWishlist,
    filterByType,
    reload: loadItems,
  };
}
