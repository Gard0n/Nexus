import type { MediaType } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';

const MEDIA_TYPES: MediaType[] = ['movie', 'tv', 'book', 'game', 'music'];

interface Props {
  activeTab: MediaType;
  onTabChange: (type: MediaType) => void;
  counts: Record<MediaType, number>;
}

export function SearchTabs({ activeTab, onTabChange, counts }: Props) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {MEDIA_TYPES.map((type) => {
        const config = MEDIA_CONFIG[type];
        const count = counts[type] || 0;
        return (
          <button
            key={type}
            onClick={() => onTabChange(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              activeTab === type
                ? 'bg-nexus-accent text-white'
                : 'bg-nexus-surface text-nexus-text-muted hover:text-nexus-text'
            }`}
            style={activeTab === type ? { backgroundColor: config.color } : undefined}
          >
            {config.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === type ? 'bg-white/20' : 'bg-nexus-bg'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
