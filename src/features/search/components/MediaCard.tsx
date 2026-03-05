import { useState } from 'react';
import { Plus, Check, Bookmark } from 'lucide-react';
import type { NormalizedMedia } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaIcon } from '@/components/MediaIcon';

interface MediaCardProps {
  media: NormalizedMedia;
  onAddToJournal?: (media: NormalizedMedia) => void;
  onAddToWishlist?: (media: NormalizedMedia) => void;
  onViewDetails?: (media: NormalizedMedia) => void;
  isInJournal?: boolean;
  isInWishlist?: boolean;
}

export function MediaCard({ media, onAddToJournal, onAddToWishlist, onViewDetails, isInJournal, isInWishlist }: MediaCardProps) {
  const config = MEDIA_CONFIG[media.type];
  const [imgError, setImgError] = useState(false);
  const showImage = media.posterUrl && !imgError;

  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-lg overflow-hidden hover:border-nexus-accent/50 transition-colors group">
      <div
        className="relative aspect-[2/3] bg-nexus-bg overflow-hidden cursor-pointer"
        onClick={() => onViewDetails?.(media)}
      >
        {showImage ? (
          <img
            src={media.posterUrl!}
            alt={media.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MediaIcon type={media.type} size={48} className="opacity-30" />
          </div>
        )}
        {onViewDetails && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full transition-opacity">
              Détails
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          >
            <MediaIcon type={media.type} size={14} />
            {config.label}
          </div>
        </div>
        {/* Journal / Wishlist indicators */}
        {(isInJournal || isInWishlist) && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isInJournal && (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md" title="Déjà dans le journal">
                <Check size={13} className="text-white" strokeWidth={3} />
              </div>
            )}
            {isInWishlist && !isInJournal && (
              <div className="w-6 h-6 rounded-full bg-nexus-accent flex items-center justify-center shadow-md" title="Dans la wishlist">
                <Bookmark size={12} className="text-white" fill="currentColor" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{media.title}</h3>
        {media.year && (
          <p className="text-xs text-nexus-text-muted mb-2">{media.year}</p>
        )}
        {media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {media.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-0.5 bg-nexus-bg rounded-full text-nexus-text-muted"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {onAddToJournal && (
            <button
              onClick={() => onAddToJournal(media)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-nexus-accent hover:bg-nexus-accent-hover text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
              {config.verb}
            </button>
          )}
          {onAddToWishlist && (
            <button
              onClick={() => onAddToWishlist(media)}
              className="px-3 py-1.5 border border-nexus-border hover:border-nexus-accent text-xs font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
