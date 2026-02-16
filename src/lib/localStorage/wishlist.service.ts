import type { WishlistItem, NormalizedMedia } from '@/types/media';

const WISHLIST_KEY = 'nexus_wishlist';

export class WishlistService {
  private getAll(): WishlistItem[] {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  }

  private save(items: WishlistItem[]): void {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }

  public list(): WishlistItem[] {
    return this.getAll().sort((a, b) => {
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
  }

  public add(media: NormalizedMedia, priority = 0): WishlistItem {
    const items = this.getAll();

    // Check if already exists
    const exists = items.find(
      (item) => item.media.externalId === media.externalId && item.media.type === media.type
    );
    if (exists) {
      return exists;
    }

    const newItem: WishlistItem = {
      id: crypto.randomUUID(),
      userId: 'local-user',
      media,
      priority,
      addedAt: new Date().toISOString(),
    };
    items.push(newItem);
    this.save(items);
    return newItem;
  }

  public remove(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    this.save(filtered);
    return true;
  }

  public removeByMedia(externalId: string, type: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(
      (item) => !(item.media.externalId === externalId && item.media.type === type)
    );
    if (filtered.length === items.length) return false;
    this.save(filtered);
    return true;
  }

  public getById(id: string): WishlistItem | null {
    return this.getAll().find((item) => item.id === id) || null;
  }

  public filterByType(type: string): WishlistItem[] {
    return this.list().filter((item) => item.media.type === type);
  }

  public isInWishlist(externalId: string, type: string): boolean {
    return this.getAll().some(
      (item) => item.media.externalId === externalId && item.media.type === type
    );
  }
}

export const wishlistService = new WishlistService();
