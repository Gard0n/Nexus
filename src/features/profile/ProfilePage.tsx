import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useCulturalDna } from '@/hooks/useCulturalDna';
import { CulturalDna } from './components/CulturalDna';

export function ProfilePage() {
  const { user } = useAuth();
  const { entries } = useJournal();
  const stats = useCulturalDna(entries);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profil</h2>

      {/* User Info */}
      <div className="bg-nexus-surface border border-nexus-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-nexus-accent/20 flex items-center justify-center">
            <User size={28} className="text-nexus-accent" />
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.user_metadata?.display_name ?? user?.email ?? 'Utilisateur'}</p>
            <p className="text-sm text-nexus-text-muted">{user?.email ?? 'Mode développement'}</p>
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
