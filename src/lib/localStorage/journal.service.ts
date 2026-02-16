import type { JournalEntry, NormalizedMedia } from '@/types/media';

const JOURNAL_KEY = 'nexus_journal';

export class JournalService {
  private getAll(): JournalEntry[] {
    const data = localStorage.getItem(JOURNAL_KEY);
    return data ? JSON.parse(data) : [];
  }

  private save(entries: JournalEntry[]): void {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  }

  public list(): JournalEntry[] {
    return this.getAll().sort((a, b) => {
      return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
    });
  }

  public add(
    media: NormalizedMedia,
    data: {
      consumedAt: string;
      rating: number | null;
      note: string;
      tags: string[];
      isRewatch: boolean;
    }
  ): JournalEntry {
    const entries = this.getAll();
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      userId: 'local-user',
      media,
      consumedAt: data.consumedAt,
      rating: data.rating,
      note: data.note,
      tags: data.tags,
      isRewatch: data.isRewatch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    this.save(entries);
    return newEntry;
  }

  public update(id: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'media'>>): JournalEntry | null {
    const entries = this.getAll();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save(entries);
    return entries[index];
  }

  public delete(id: string): boolean {
    const entries = this.getAll();
    const filtered = entries.filter((e) => e.id !== id);
    if (filtered.length === entries.length) return false;
    this.save(filtered);
    return true;
  }

  public getById(id: string): JournalEntry | null {
    return this.getAll().find((e) => e.id === id) || null;
  }

  public filterByType(type: string): JournalEntry[] {
    return this.list().filter((e) => e.media.type === type);
  }

  public filterByTag(tag: string): JournalEntry[] {
    return this.list().filter((e) => e.tags.includes(tag));
  }

  public getAllTags(): string[] {
    const entries = this.getAll();
    const allTags = entries.flatMap((e) => e.tags);
    return Array.from(new Set(allTags)).sort();
  }
}

export const journalService = new JournalService();
