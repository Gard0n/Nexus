import { SlidersHorizontal } from 'lucide-react';

interface Props {
  showFilters: boolean;
  onToggle: () => void;
  filterGenre: string;
  filterYear: string;
  availableGenres: string[];
  onGenreChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export function SearchFilters({
  showFilters,
  onToggle,
  filterGenre,
  filterYear,
  availableGenres,
  onGenreChange,
  onYearChange,
  onReset,
  activeFilterCount,
}: Props) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
          showFilters || activeFilterCount > 0
            ? 'border-nexus-accent text-nexus-accent'
            : 'border-nexus-border text-nexus-text-muted hover:border-nexus-accent hover:text-nexus-accent'
        }`}
      >
        <SlidersHorizontal size={14} />
        Filtrer
        {activeFilterCount > 0 && (
          <span className="bg-nexus-accent text-white text-xs px-1.5 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-3">
          {availableGenres.length > 0 && (
            <select
              value={filterGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="px-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent"
            >
              <option value="">Tous les genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
          <input
            type="number"
            value={filterYear}
            onChange={(e) => onYearChange(e.target.value)}
            placeholder="Année"
            min="1900"
            max={new Date().getFullYear()}
            className="w-24 px-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg text-sm text-nexus-text focus:outline-none focus:border-nexus-accent placeholder:text-nexus-text-muted"
          />
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-sm text-nexus-text-muted hover:text-nexus-accent transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  );
}
