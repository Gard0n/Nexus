import { useRef } from 'react';
import { User, Download, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useToast } from '@/contexts/ToastContext';
import { useCulturalDna } from '@/hooks/useCulturalDna';
import { CulturalDna } from './components/CulturalDna';
import type { JournalEntry } from '@/types/media';

export function ProfilePage() {
  const { user } = useAuth();
  const { entries, importEntries } = useJournal();
  const { showToast } = useToast();
  const stats = useCulturalDna(entries);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as JournalEntry[];
        if (!Array.isArray(parsed)) throw new Error('Format invalide');
        const count = importEntries(parsed);
        showToast(count > 0 ? `${count} entrée(s) importée(s)` : 'Aucune nouvelle entrée');
      } catch {
        showToast('Fichier JSON invalide');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Journal exporté');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profil</h2>

      {/* User Info */}
      <div className="bg-nexus-surface border border-nexus-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-nexus-accent/20 flex items-center justify-center">
              <User size={28} className="text-nexus-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.user_metadata?.display_name ?? user?.email ?? 'Utilisateur'}</p>
              <p className="text-sm text-nexus-text-muted">{user?.email ?? 'Mode développement'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-nexus-surface border border-nexus-border hover:border-nexus-accent rounded-lg text-sm font-medium transition-colors"
            >
              <Upload size={16} />
              Importer
            </button>
            <button
              onClick={handleExport}
              disabled={entries.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-nexus-accent hover:bg-nexus-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Cultural DNA */}
      <div className="bg-nexus-surface border border-nexus-border rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">ADN Culturel</h3>
        <CulturalDna stats={stats} />
      </div>
    </div>
  );
}
