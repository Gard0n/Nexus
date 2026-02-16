import axios from 'axios';
import type { MediaApiAdapter, PaginatedResult } from '../types';
import type { NormalizedMedia } from '@/types/media';
import { RAWG_API_KEY } from '@/config/api-keys';

const BASE_URL = 'https://api.rawg.io/api';

interface RAWGGame {
  id: number;
  name: string;
  released?: string;
  background_image?: string;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ platform: { name: string } }>;
  rating?: number;
  metacritic?: number;
}

interface RAWGSearchResponse {
  results: RAWGGame[];
  count: number;
  next: string | null;
}

function normalizeResult(game: RAWGGame): NormalizedMedia {
  const year = game.released ? game.released.slice(0, 4) : null;
  const genres = (game.genres || []).map((g) => g.name);
  const platforms = (game.platforms || []).map((p) => p.platform.name).slice(0, 5);

  return {
    externalId: String(game.id),
    type: 'game',
    title: game.name,
    year,
    posterUrl: game.background_image || null,
    genres,
    metadata: {
      platforms,
      rating: game.rating || null,
      metacritic: game.metacritic || null,
    },
  };
}

class RAWGAdapter implements MediaApiAdapter {
  async search(query: string, page = 1): Promise<PaginatedResult> {
    if (!RAWG_API_KEY) {
      throw new Error('RAWG API key not configured');
    }

    const response = await axios.get<RAWGSearchResponse>(`${BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        search: query,
        page,
        page_size: 20,
      },
    });

    return {
      results: response.data.results.map(normalizeResult),
      hasMore: response.data.next !== null,
      totalResults: response.data.count,
    };
  }

  async getDetails(id: string): Promise<NormalizedMedia> {
    if (!RAWG_API_KEY) {
      throw new Error('RAWG API key not configured');
    }

    const response = await axios.get<RAWGGame>(`${BASE_URL}/games/${id}`, {
      params: { key: RAWG_API_KEY },
    });

    const game = response.data;
    const year = game.released ? game.released.slice(0, 4) : null;
    const genres = (game.genres || []).map((g) => g.name);
    const platforms = (game.platforms || []).map((p) => p.platform.name);

    return {
      externalId: String(game.id),
      type: 'game',
      title: game.name,
      year,
      posterUrl: game.background_image || null,
      genres,
      metadata: {
        platforms,
        rating: game.rating || null,
        metacritic: game.metacritic || null,
      },
    };
  }
}

export const rawgAdapter = new RAWGAdapter();
