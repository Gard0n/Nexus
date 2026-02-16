import axios from 'axios';
import type { MediaApiAdapter, PaginatedResult } from '../types';
import type { NormalizedMedia } from '@/types/media';
import { TMDB_API_KEY, TMDB_LANGUAGE } from '@/config/api-keys';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  genre_ids?: number[];
  overview?: string;
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

interface TMDBDetailResponse extends TMDBSearchResult {
  genres?: Array<{ id: number; name: string }>;
  credits?: {
    cast?: Array<{ name: string; character: string }>;
  };
}

let genreCache: Record<number, string> = {};

async function fetchGenres(): Promise<void> {
  if (Object.keys(genreCache).length > 0) return;

  try {
    const [movieGenres, tvGenres] = await Promise.all([
      axios.get(`${BASE_URL}/genre/movie/list`, {
        params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE },
      }),
      axios.get(`${BASE_URL}/genre/tv/list`, {
        params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE },
      }),
    ]);

    const allGenres = [
      ...(movieGenres.data.genres || []),
      ...(tvGenres.data.genres || []),
    ];

    genreCache = allGenres.reduce((acc: Record<number, string>, genre: { id: number; name: string }) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to fetch TMDB genres:', error);
  }
}

function normalizeResult(item: TMDBSearchResult, type: 'movie' | 'tv'): NormalizedMedia {
  const title = item.title || item.name || '';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const posterUrl = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
  const genres = (item.genre_ids || []).map((id) => genreCache[id] || `Genre ${id}`);

  return {
    externalId: String(item.id),
    type,
    title,
    year,
    posterUrl,
    genres,
    metadata: {
      overview: item.overview || '',
    },
  };
}

class TMDBMovieAdapter implements MediaApiAdapter {
  async search(query: string, page = 1): Promise<PaginatedResult> {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB API key not configured');
    }

    await fetchGenres();

    const response = await axios.get<TMDBSearchResponse>(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
        language: TMDB_LANGUAGE,
      },
    });

    return {
      results: response.data.results.map((item) => normalizeResult(item, 'movie')),
      hasMore: page < response.data.total_pages,
      totalResults: response.data.total_results,
    };
  }

  async getDetails(id: string): Promise<NormalizedMedia> {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB API key not configured');
    }

    await fetchGenres();

    const response = await axios.get<TMDBDetailResponse>(`${BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: TMDB_LANGUAGE,
        append_to_response: 'credits',
      },
    });

    const item = response.data;
    const title = item.title || '';
    const year = (item.release_date || '').slice(0, 4);
    const posterUrl = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
    const genres = (item.genres || []).map((g) => g.name);
    const cast = (item.credits?.cast || []).slice(0, 5).map((c) => c.name);

    return {
      externalId: String(item.id),
      type: 'movie',
      title,
      year,
      posterUrl,
      genres,
      metadata: {
        overview: item.overview || '',
        cast,
      },
    };
  }
}

class TMDBTVAdapter implements MediaApiAdapter {
  async search(query: string, page = 1): Promise<PaginatedResult> {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB API key not configured');
    }

    await fetchGenres();

    const response = await axios.get<TMDBSearchResponse>(`${BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
        language: TMDB_LANGUAGE,
      },
    });

    return {
      results: response.data.results.map((item) => normalizeResult(item, 'tv')),
      hasMore: page < response.data.total_pages,
      totalResults: response.data.total_results,
    };
  }

  async getDetails(id: string): Promise<NormalizedMedia> {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB API key not configured');
    }

    await fetchGenres();

    const response = await axios.get<TMDBDetailResponse>(`${BASE_URL}/tv/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: TMDB_LANGUAGE,
        append_to_response: 'credits',
      },
    });

    const item = response.data;
    const title = item.name || '';
    const year = (item.first_air_date || '').slice(0, 4);
    const posterUrl = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
    const genres = (item.genres || []).map((g) => g.name);
    const cast = (item.credits?.cast || []).slice(0, 5).map((c) => c.name);

    return {
      externalId: String(item.id),
      type: 'tv',
      title,
      year,
      posterUrl,
      genres,
      metadata: {
        overview: item.overview || '',
        cast,
      },
    };
  }
}

export const tmdbMovieAdapter = new TMDBMovieAdapter();
export const tmdbTVAdapter = new TMDBTVAdapter();
