import type { MediaType, NormalizedMedia } from '@/types/media';
import type { MediaApiAdapter, PaginatedResult } from './types';
import { tmdbMovieAdapter, tmdbTVAdapter } from './adapters/tmdb.adapter';
import { openLibraryAdapter } from './adapters/openLibrary.adapter';
import { rawgAdapter } from './adapters/rawg.adapter';
import { musicBrainzAdapter } from './adapters/musicBrainz.adapter';

const adapters: Record<MediaType, MediaApiAdapter> = {
  movie: tmdbMovieAdapter,
  tv: tmdbTVAdapter,
  book: openLibraryAdapter,
  game: rawgAdapter,
  music: musicBrainzAdapter,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function searchByType(
  type: MediaType,
  query: string,
  page = 1
): Promise<PaginatedResult> {
  const adapter = adapters[type];
  if (!adapter) {
    throw new Error(`No adapter found for type: ${type}`);
  }
  const key = `search:${type}:${query}:${page}`;
  const cached = getCache<PaginatedResult>(key);
  if (cached) return cached;
  const result = await adapter.search(query, page);
  setCache(key, result);
  return result;
}

export async function searchAll(
  query: string
): Promise<Record<MediaType, PaginatedResult>> {
  const results = await Promise.allSettled(
    Object.entries(adapters).map(async ([type, adapter]) => {
      const key = `search:${type}:${query}:1`;
      const cached = getCache<PaginatedResult>(key);
      if (cached) return [type, cached] as [MediaType, PaginatedResult];
      const result = await adapter.search(query, 1);
      setCache(key, result);
      return [type, result] as [MediaType, PaginatedResult];
    })
  );

  const successfulResults: Record<string, PaginatedResult> = {};
  results.forEach((result, index) => {
    const type = Object.keys(adapters)[index] as MediaType;
    if (result.status === 'fulfilled') {
      successfulResults[type] = result.value[1];
    } else {
      console.error(`Failed to search ${type}:`, result.reason);
      successfulResults[type] = { results: [], hasMore: false, totalResults: 0 };
    }
  });

  return successfulResults as Record<MediaType, PaginatedResult>;
}

export async function getMediaDetails(
  type: MediaType,
  id: string
): Promise<NormalizedMedia> {
  const adapter = adapters[type];
  if (!adapter) {
    throw new Error(`No adapter found for type: ${type}`);
  }
  const key = `details:${type}:${id}`;
  const cached = getCache<NormalizedMedia>(key);
  if (cached) return cached;
  const result = await adapter.getDetails(id);
  setCache(key, result);
  return result;
}
