import { Calendar, X, Check, ChevronUp, ChevronDown } from 'lucide-react';
import type { WishlistItem } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaIcon } from '@/components/MediaIcon';

interface WishlistItemProps {
  item: WishlistItem;
  isFirst?: boolean;
  isLast?: boolean;
  onRemove?: (id: string) => void;
  onMarkAsConsumed?: (item: WishlistItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function WishlistItemCard({ item, isFirst, isLast, onRemove, onMarkAsConsumed, onMoveUp, onMoveDown }: WishlistItemProps) {
  const config = MEDIA_CONFIG[item.media.type];
  const addedDate = new Date(item.addedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-lg overflow-hidden hover:border-nexus-accent/50 transition-colors group flex">
      {/* Priority arrows */}
      <div className="flex flex-col items-center justify-center px-2 gap-1 border-r border-nexus-border bg-nexus-bg">
        <button onClick={onMoveUp} disabled={isFirst}
          className="p-1 text-nexus-text-muted hover:text-nexus-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Monter">
          <ChevronUp size={16} />
        </button>
        <button onClick={onMoveDown} disabled={isLast}
          className="p-1 text-nexus-text-muted hover:text-nexus-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Descendre">
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex gap-4 p-4 flex-1">
        <div className="flex-shrink-0">
          {item.media.posterUrl ? (
            <img src={item.media.posterUrl} alt={item.media.title} className="w-20 h-28 object-cover rounded" />
          ) : (
            <div className="w-20 h-28 bg-nexus-bg rounded flex items-center justify-center">
              <MediaIcon type={item.media.type} size={32} className="opacity-30" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MediaIcon type={item.media.type} size={16} />
                <h3 className="font-semibold text-lg line-clamp-1">{item.media.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-sm text-nexus-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Ajouté le {addedDate}
                </span>
                {item.media.year && <span>• {item.media.year}</span>}
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}>
              {config.label}
            </div>
          </div>

          {item.media.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.media.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="px-2 py-1 bg-nexus-bg rounded-full text-xs text-nexus-text-muted">{genre}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {onMarkAsConsumed && (
              <button onClick={() => onMarkAsConsumed(item)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: config.color, color: 'white' }}>
                <Check size={14} />
                J'ai {config.verb.toLowerCase()}
              </button>
            )}
            {onRemove && (
              <button onClick={() => onRemove(item.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-nexus-bg hover:bg-red-500/20 border border-nexus-border hover:border-red-500/50 rounded-lg text-xs font-medium text-nexus-text-muted hover:text-red-400 transition-colors">
                <X size={14} />
                Retirer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
