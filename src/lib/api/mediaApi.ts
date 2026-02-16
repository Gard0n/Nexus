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

export async function searchByType(
  type: MediaType,
  query: string,
  page = 1
): Promise<PaginatedResult> {
  const adapter = adapters[type];
  if (!adapter) {
    throw new Error(`No adapter found for type: ${type}`);
  }
  return adapter.search(query, page);
}

export async function searchAll(
  query: string
): Promise<Record<MediaType, PaginatedResult>> {
  const results = await Promise.allSettled(
    Object.entries(adapters).map(async ([type, adapter]) => {
      const result = await adapter.search(query, 1);
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
  return adapter.getDetails(id);
}
