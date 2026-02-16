import { BookOpen, Loader2 } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { JournalEntryCard } from './components/JournalEntry';

export function JournalPage() {
  const { entries, loading, deleteEntry } = useJournal();

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

  // Group entries by month
  const entriesByMonth = entries.reduce((acc, entry) => {
    const date = new Date(entry.consumedAt);
    const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Journal</h2>
        <p className="text-sm text-nexus-text-muted">
          {entries.length} {entries.length > 1 ? 'entrées' : 'entrée'}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
          <div key={month}>
            <h3 className="text-lg font-semibold text-nexus-text-muted mb-4 capitalize">
              {month}
            </h3>
            <div className="space-y-4">
              {monthEntries.map((entry, index) => (
                <div key={entry.id} className="stagger-item">
                  <JournalEntryCard
                    entry={entry}
                    onDelete={deleteEntry}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
