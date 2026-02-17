import axios from 'axios';
import type { MediaApiAdapter, PaginatedResult } from '../types';
import type { NormalizedMedia } from '@/types/media';

const BASE_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org/b/id';

interface OpenLibraryDoc {
  key: string;
  title: string;
  first_publish_year?: number;
  author_name?: string[];
  cover_i?: number;
  publisher?: string[];
  isbn?: string[];
  subject?: string[];
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

function normalizeResult(doc: OpenLibraryDoc): NormalizedMedia {
  const coverUrl = doc.cover_i ? `${COVERS_URL}/${doc.cover_i}-M.jpg` : null;
  const genres = (doc.subject || [])
    .filter((s) => s.length < 30)
    .slice(0, 5);

  return {
    externalId: doc.key,
    type: 'book',
    title: doc.title,
    year: doc.first_publish_year ? String(doc.first_publish_year) : null,
    posterUrl: coverUrl,
    genres,
    metadata: {
      authors: doc.author_name || [],
      publisher: doc.publisher?.[0] || '',
      isbn: doc.isbn?.[0] || '',
    },
  };
}

class OpenLibraryAdapter implements MediaApiAdapter {
  async search(query: string, page = 1): Promise<PaginatedResult> {
    const response = await axios.get<OpenLibraryResponse>(`${BASE_URL}/search.json`, {
      params: {
        q: query,
        page,
        limit: 20,
      },
    });

    const totalPages = Math.ceil(response.data.numFound / 20);

    return {
      results: response.data.docs.map(normalizeResult),
      hasMore: page < totalPages,
      totalResults: response.data.numFound,
    };
  }

  async getDetails(key: string): Promise<NormalizedMedia> {
    // Open Library doesn't have a separate details endpoint, so we search by key
    const workKey = key.replace('/works/', '');
    const response = await axios.get(`${BASE_URL}/works/${workKey}.json`);

    const work = response.data;
    const title = work.title || '';
    const year = work.first_publish_date ? work.first_publish_date.slice(0, 4) : null;

    // Try to get cover
    let coverUrl = null;
    if (work.covers && work.covers[0]) {
      coverUrl = `${COVERS_URL}/${work.covers[0]}-M.jpg`;
    }

    return {
      externalId: key,
      type: 'book',
      title,
      year,
      posterUrl: coverUrl,
      genres: [],
      metadata: {
        description: work.description?.value || work.description || '',
        subjects: work.subjects?.slice(0, 5) || [],
      },
    };
  }
}

export const openLibraryAdapter = new OpenLibraryAdapter();
