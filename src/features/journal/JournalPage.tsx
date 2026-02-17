import { useState } from 'react';
import { BookOpen, Loader2, Filter, ArrowUpDown } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { useToast } from '@/contexts/ToastContext';
import { JournalEntryCard } from './components/JournalEntry';
import { LogMediaModal } from './components/LogMediaModal';
import type { JournalEntry } from '@/types/media';

export function JournalPage() {
  const { entries, loading, updateEntry, deleteEntry, getAllTags } = useJournal();
  const { showToast } = useToast();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-nexus-accent animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Journal</h2>
        <div className="flex flex-col items-center justify-center py-20 text-nexus-text-muted">
          <BookOpen size={48} className="mb-4 opacity-40" />
          <p className="text-lg mb-2">Ton journal est vide</p>
          <p className="text-sm">Cherche une œuvre et ajoute-la à ton journal.</p>
        </div>
      </div>
    );
  }

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      if (filterType !== 'all' && entry.media.type !== filterType) return false;
      if (filterTag !== 'all' && !entry.tags.includes(filterTag)) return false;
      if (entry.rating && entry.rating < filterMinRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });

  // Group entries by month
  const entriesByMonth = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.consumedAt);
    const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, typeof filteredEntries>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Journal</h2>
        <p className="text-sm text-nexus-text-muted">
          {filteredEntries.length}/{entries.length} {entries.length > 1 ? 'entrées' : 'entrée'}
        </p>
      </div>

      {/* Filters & Sort */}
      <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent"
            >
              <option value="all">Tous</option>
              <option value="movie">Films</option>
              <option value="tv">Séries</option>
              <option value="book">Livres</option>
              <option value="game">Jeux</option>
              <option value="music">Musique</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Tag
            </label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent"
            >
              <option value="all">Tous</option>
              {getAllTags().map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Note min: {filterMinRating}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <ArrowUpDown size={14} className="inline mr-1" />
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent"
            >
              <option value="date">Date (récent)</option>
              <option value="rating">Note (meilleure)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-nexus-text-muted">
          <Filter size={48} className="mb-4 opacity-40" />
          <p className="text-lg mb-2">Aucune entrée ne correspond aux filtres</p>
          <button
            onClick={() => {
              setFilterType('all');
              setFilterTag('all');
              setFilterMinRating(0);
            }}
            className="text-sm text-nexus-accent hover:underline mt-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
          <div key={month}>
            <h3 className="text-lg font-semibold text-nexus-text-muted mb-4 capitalize">
              {month}
            </h3>
            <div className="space-y-4">
              {monthEntries.map((entry) => (
                <div key={entry.id} className="stagger-item">
                  <JournalEntryCard
                    entry={entry}
                    onEdit={() => setEditingEntry(entry)}
                    onDelete={deleteEntry}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <LogMediaModal
          media={editingEntry.media}
          existingTags={getAllTags()}
          initialData={{
            consumedAt: editingEntry.consumedAt,
            rating: editingEntry.rating,
            note: editingEntry.note,
            tags: editingEntry.tags,
            isRewatch: editingEntry.isRewatch,
          }}
          onClose={() => setEditingEntry(null)}
          onSubmit={(data) => {
            updateEntry(editingEntry.id, data);
            setEditingEntry(null);
            showToast('Entrée modifiée');
          }}
        />
      )}
    </div>
  );
}
