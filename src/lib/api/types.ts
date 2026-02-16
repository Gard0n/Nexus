import type { NormalizedMedia } from '@/types/media';

export interface PaginatedResult {
  results: NormalizedMedia[];
  hasMore: boolean;
  totalResults?: number;
}

export interface MediaApiAdapter {
  search(query: string, page?: number): Promise<PaginatedResult>;
  getDetails(id: string): Promise<NormalizedMedia>;
}
