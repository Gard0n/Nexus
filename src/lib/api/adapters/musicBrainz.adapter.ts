import axios from 'axios';
import type { MediaApiAdapter, PaginatedResult } from '../types';
import type { NormalizedMedia } from '@/types/media';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const COVER_ART_URL = 'https://coverartarchive.org';

interface MusicBrainzRelease {
  id: string;
  title: string;
  date?: string;
  'artist-credit'?: Array<{ name: string }>;
  'label-info'?: Array<{ label?: { name: string } }>;
  genres?: Array<{ name: string; count: number }>;
  tags?: Array<{ name: string; count: number }>;
}

interface MusicBrainzSearchResponse {
  releases: MusicBrainzRelease[];
  count: number;
  offset: number;
}

function normalizeResult(release: MusicBrainzRelease): NormalizedMedia {
  const year = release.date ? release.date.slice(0, 4) : null;
  const artists = (release['artist-credit'] || []).map((a) => a.name);
  const label = release['label-info']?.[0]?.label?.name || '';
  const genres = (release.genres || release.tags || [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((g) => g.name);

  // Try to get cover art
  const coverUrl = `${COVER_ART_URL}/release/${release.id}/front-250`;

  return {
    externalId: release.id,
    type: 'music',
    title: release.title,
    year,
    posterUrl: coverUrl,
    genres,
    metadata: {
      artists,
      label,
    },
  };
}

class MusicBrainzAdapter implements MediaApiAdapter {
  private delay = 1000; // MusicBrainz rate limit: 1 req/s
  private lastRequest = 0;

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.delay - timeSinceLastRequest));
    }
    this.lastRequest = Date.now();
  }

  async search(query: string, page = 1): Promise<PaginatedResult> {
    await this.throttle();

    const offset = (page - 1) * 20;
    const response = await axios.get<MusicBrainzSearchResponse>(`${BASE_URL}/release`, {
      params: {
        query,
        fmt: 'json',
        limit: 20,
        offset,
      },
      headers: {
        'User-Agent': 'Nexus/1.0.0 (https://nexus.app)',
      },
    });

    const totalPages = Math.ceil(response.data.count / 20);

    return {
      results: response.data.releases.map(normalizeResult),
      hasMore: page < totalPages,
      totalResults: response.data.count,
    };
  }

  async getDetails(id: string): Promise<NormalizedMedia> {
    await this.throttle();

    const response = await axios.get<MusicBrainzRelease>(`${BASE_URL}/release/${id}`, {
      params: {
        fmt: 'json',
        inc: 'artists+labels+recordings+genres+tags',
      },
      headers: {
        'User-Agent': 'Nexus/1.0.0 (https://nexus.app)',
      },
    });

    const release = response.data;
    const year = release.date ? release.date.slice(0, 4) : null;
    const artists = (release['artist-credit'] || []).map((a) => a.name);
    const label = release['label-info']?.[0]?.label?.name || '';
    const coverUrl = `${COVER_ART_URL}/release/${id}/front-500`;
    const genres = (release.genres || release.tags || [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((g) => g.name);

    return {
      externalId: id,
      type: 'music',
      title: release.title,
      year,
      posterUrl: coverUrl,
      genres,
      metadata: {
        artists,
        label,
      },
    };
  }
}

export const musicBrainzAdapter = new MusicBrainzAdapter();
