import { Star, Calendar, Tag, Repeat } from 'lucide-react';
import type { JournalEntry } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaIcon } from '@/components/MediaIcon';

interface JournalEntryProps {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (id: string) => void;
}

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryProps) {
  const config = MEDIA_CONFIG[entry.media.type];
  const date = new Date(entry.consumedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-lg overflow-hidden hover:border-nexus-accent/50 transition-colors group">
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="flex-shrink-0">
          {entry.media.posterUrl ? (
            <img
              src={entry.media.posterUrl}
              alt={entry.media.title}
              className="w-20 h-28 object-cover rounded"
            />
          ) : (
            <div className="w-20 h-28 bg-nexus-bg rounded flex items-center justify-center">
              <MediaIcon type={entry.media.type} size={32} className="opacity-30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MediaIcon type={entry.media.type} size={16} />
                <h3 className="font-semibold text-lg line-clamp-1">{entry.media.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-sm text-nexus-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {date}
                </span>
                {entry.media.year && <span>• {entry.media.year}</span>}
                {entry.isRewatch && (
                  <span className="flex items-center gap-1">
                    • <Repeat size={14} /> Revisite
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {entry.rating && (
              <div
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                }}
              >
                <Star size={14} fill="currentColor" />
                {entry.rating}/10
              </div>
            )}
          </div>

          {/* Note */}
          {entry.note && (
            <p className="text-sm text-nexus-text-muted line-clamp-3 mb-3">
              {entry.note}
            </p>
          )}

          {/* Tags + Genres */}
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-nexus-bg rounded-full text-xs text-nexus-text-muted"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
            {entry.media.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: `${config.color}15`,
                  color: config.color,
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions (shown on hover) */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(entry)}
              className="text-xs text-nexus-text-muted hover:text-nexus-accent transition-colors"
            >
              Modifier
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="text-xs text-nexus-text-muted hover:text-red-400 transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
