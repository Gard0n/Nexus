import { Search, Loader2 } from 'lucide-react';

interface Props {
  query: string;
  onChange: (value: string) => void;
  loading: boolean;
}

export function SearchBar({ query, onChange, loading }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Recherche</h2>
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Chercher un film, série, livre, jeu, album..."
          className="w-full pl-12 pr-4 py-3 bg-nexus-surface border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text placeholder:text-nexus-text-muted"
        />
        {loading && (
          <Loader2
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-nexus-accent animate-spin"
          />
        )}
      </div>
    </div>
  );
}
