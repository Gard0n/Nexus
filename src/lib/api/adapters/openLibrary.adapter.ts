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
    const workKey = key.replace('/works/', '');
    const response = await axios.get(`${BASE_URL}/works/${workKey}.json`);

    const work = response.data;
    const title = work.title || '';

    // first_publish_date can be "January 1990" or "1990" — extract 4-digit year
    const yearMatch = String(work.first_publish_date || '').match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : null;

    // description can be a TypedText object { type, value } or a plain string
    const description =
      typeof work.description === 'string'
        ? work.description
        : (work.description?.value as string) || '';

    // subjects as genres (same filter as search)
    const subjects: string[] = work.subjects || [];
    const genres = subjects.filter((s) => s.length < 30).slice(0, 5);

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
      genres,
      metadata: {
        description,
        subjects: subjects.slice(0, 8),
      },
    };
  }
}

export const openLibraryAdapter = new OpenLibraryAdapter();
