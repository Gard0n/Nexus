import { useState, useMemo } from 'react';
import { BookOpen, Loader2, Filter, ArrowUpDown, Search } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { useToast } from '@/contexts/ToastContext';
import { JournalEntryCard } from './components/JournalEntry';
import { LogMediaModal } from './components/LogMediaModal';
import type { JournalEntry } from '@/types/media';

export function JournalPage() {
  const { entries, loading, updateEntry, deleteEntry, getAllTags } = useJournal();
  const { showToast } = useToast();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  // Rewatch counts per media (externalId+type)
  const rewatchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      const key = `${e.media.type}-${e.media.externalId}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [entries]);

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

  const filteredEntries = entries
    .filter((entry) => {
      if (searchText && !entry.media.title.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (filterType !== 'all' && entry.media.type !== filterType) return false;
      if (filterStatus !== 'all' && (entry.status ?? 'completed') !== filterStatus) return false;
      if (filterTag !== 'all' && !entry.tags.includes(filterTag)) return false;
      if (entry.rating && entry.rating < filterMinRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
      return (b.rating || 0) - (a.rating || 0);
    });

  const entriesByMonth = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.consumedAt);
    const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) acc[monthKey] = [];
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

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Rechercher par titre..."
          className="w-full pl-9 pr-4 py-2.5 bg-nexus-surface border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text placeholder:text-nexus-text-muted text-sm"
        />
      </div>

      {/* Filters & Sort */}
      <div className="bg-nexus-surface border border-nexus-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Type
            </label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent">
              <option value="all">Tous</option>
              <option value="movie">Films</option>
              <option value="tv">Séries</option>
              <option value="book">Livres</option>
              <option value="game">Jeux</option>
              <option value="music">Musique</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Statut
            </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent">
              <option value="all">Tous</option>
              <option value="completed">Terminé</option>
              <option value="in_progress">En cours</option>
              <option value="abandoned">Abandonné</option>
            </select>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Tag
            </label>
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent">
              <option value="all">Tous</option>
              {getAllTags().map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={14} className="inline mr-1" />
              Note min: {filterMinRating}/10
            </label>
            <input type="range" min="0" max="10" value={filterMinRating}
              onChange={(e) => setFilterMinRating(Number(e.target.value))}
              className="w-full" />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <ArrowUpDown size={14} className="inline mr-1" />
              Trier par
            </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
              className="w-full px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent">
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
          <p className="text-lg mb-2">Aucune entrée ne correspond</p>
          <button
            onClick={() => { setSearchText(''); setFilterType('all'); setFilterStatus('all'); setFilterTag('all'); setFilterMinRating(0); }}
            className="text-sm text-nexus-accent hover:underline mt-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
            <div key={month}>
              <h3 className="text-lg font-semibold text-nexus-text-muted mb-4 capitalize">{month}</h3>
              <div className="space-y-4">
                {monthEntries.map((entry) => (
                  <div key={entry.id} className="stagger-item">
                    <JournalEntryCard
                      entry={entry}
                      rewatchCount={rewatchCounts.get(`${entry.media.type}-${entry.media.externalId}`)}
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
            status: editingEntry.status ?? 'completed',
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
