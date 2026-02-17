import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, NormalizedMedia } from '@/types/media';
import { journalService } from '@/lib/localStorage/journal.service';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(() => {
    setLoading(true);
    const data = journalService.list();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(
    (
      media: NormalizedMedia,
      data: {
        consumedAt: string;
        rating: number | null;
        note: string;
        tags: string[];
        isRewatch: boolean;
      }
    ) => {
      const newEntry = journalService.add(media, data);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    []
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'media'>>) => {
      const updated = journalService.update(id, updates);
      if (updated) {
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      }
      return updated;
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    const success = journalService.delete(id);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    return success;
  }, []);

  const filterByType = useCallback((type: string) => {
    return journalService.filterByType(type);
  }, []);

  const filterByTag = useCallback((tag: string) => {
    return journalService.filterByTag(tag);
  }, []);

  const getAllTags = useCallback(() => {
    return journalService.getAllTags();
  }, []);

  const importEntries = useCallback(
    (imported: JournalEntry[]) => {
      const count = journalService.importEntries(imported);
      loadEntries();
      return count;
    },
    [loadEntries]
  );

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    filterByType,
    filterByTag,
    getAllTags,
    importEntries,
    reload: loadEntries,
  };
}
