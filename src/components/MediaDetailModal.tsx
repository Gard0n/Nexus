import { useState, useEffect } from 'react';
import { X, Plus, BookmarkPlus, Star, Users, Monitor, BookOpen, Loader2 } from 'lucide-react';
import type { NormalizedMedia } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaIcon } from '@/components/MediaIcon';
import { getMediaDetails } from '@/lib/api/mediaApi';

interface MediaDetailModalProps {
  media: NormalizedMedia;
  onClose: () => void;
  onAddToJournal: (media: NormalizedMedia) => void;
  onAddToWishlist: (media: NormalizedMedia) => void;
}

function MetaRow({ label, value }: { label: string; value: string | string[] | null | undefined }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-nexus-text-muted shrink-0">{label} :</span>
      <span className="text-nexus-text">{display}</span>
    </div>
  );
}

export function MediaDetailModal({
  media,
  onClose,
  onAddToJournal,
  onAddToWishlist,
}: MediaDetailModalProps) {
  const [details, setDetails] = useState<NormalizedMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const config = MEDIA_CONFIG[media.type];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMediaDetails(media.type, media.externalId)
      .then((d) => {
        if (!cancelled) {
          setDetails(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetails(media); // Fallback to search data
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [media]);

  const shown = details || media;
  const meta = shown.metadata as Record<string, unknown>;

  const overview = meta?.overview as string | undefined;
  const cast = meta?.cast as string[] | undefined;
  const authors = meta?.authors as string[] | undefined;
  const description = meta?.description as string | undefined;
  const subjects = meta?.subjects as string[] | undefined;
  const platforms = meta?.platforms as string[] | undefined;
  const metacritic = meta?.metacritic as number | null | undefined;
  const rawgRating = meta?.rating as number | null | undefined;
  const artists = meta?.artists as string[] | undefined;
  const label = meta?.label as string | undefined;
  const publisher = meta?.publisher as string | undefined;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-nexus-surface border border-nexus-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex justify-end p-3 bg-nexus-surface/90 backdrop-blur">
          <button onClick={onClose} className="text-nexus-text-muted hover:text-nexus-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-2">
          <div className="flex gap-5">
            {/* Poster */}
            <div className="flex-shrink-0 w-32 md:w-44">
              {shown.posterUrl ? (
                <img
                  src={shown.posterUrl}
                  alt={shown.title}
                  className="w-full rounded-lg object-cover shadow-lg"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-nexus-bg rounded-lg flex items-center justify-center">
                  <MediaIcon type={shown.type} size={48} className="opacity-30" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md mb-3"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                <MediaIcon type={shown.type} size={12} />
                {config.label}
              </div>

              <h2 className="text-xl font-bold text-nexus-text leading-tight mb-1">
                {shown.title}
              </h2>
              {shown.year && (
                <p className="text-nexus-text-muted text-sm mb-3">{shown.year}</p>
              )}

              {/* Genres */}
              {shown.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {shown.genres.map((g) => (
                    <span key={g} className="text-xs px-2 py-0.5 bg-nexus-bg rounded-full text-nexus-text-muted">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick metadata */}
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-nexus-bg rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <MetaRow label="Avec" value={cast} />
                  <MetaRow label="Auteur(s)" value={authors} />
                  <MetaRow label="Artiste(s)" value={artists} />
                  <MetaRow label="Label" value={label} />
                  <MetaRow label="Éditeur" value={publisher} />
                  <MetaRow label="Plateformes" value={platforms} />
                  {metacritic && (
                    <div className="flex gap-2 text-sm items-center">
                      <span className="text-nexus-text-muted shrink-0">Metacritic :</span>
                      <span className="font-semibold" style={{ color: metacritic >= 75 ? '#4ecdc4' : metacritic >= 50 ? '#f5a623' : '#e94560' }}>
                        {metacritic}/100
                      </span>
                    </div>
                  )}
                  {rawgRating && !metacritic && (
                    <div className="flex gap-2 text-sm items-center">
                      <span className="text-nexus-text-muted shrink-0">Note RAWG :</span>
                      <span className="flex items-center gap-1 font-semibold text-nexus-accent">
                        <Star size={13} fill="currentColor" />{rawgRating}/5
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Synopsis / Description */}
          {loading && (
            <div className="mt-5 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-nexus-bg rounded animate-pulse" style={{ width: i === 3 ? '60%' : '100%' }} />
              ))}
            </div>
          )}
          {!loading && (overview || description) && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-nexus-text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <BookOpen size={14} />
                Synopsis
              </h3>
              <p className="text-sm text-nexus-text leading-relaxed">
                {overview || description}
              </p>
            </div>
          )}

          {/* Subjects (books) */}
          {!loading && subjects && subjects.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-nexus-text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <BookOpen size={14} />
                Sujets
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-nexus-bg rounded-full text-nexus-text-muted">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cast */}
          {!loading && cast && cast.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-nexus-text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <Users size={14} />
                Casting
              </h3>
              <p className="text-sm text-nexus-text">{cast.join(', ')}</p>
            </div>
          )}

          {/* Platforms */}
          {!loading && platforms && platforms.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-nexus-text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <Monitor size={14} />
                Plateformes
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <span key={p} className="text-xs px-2 py-0.5 bg-nexus-bg rounded-full text-nexus-text-muted">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-nexus-border">
            <button
              onClick={() => onAddToJournal(shown)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: config.color }}
            >
              <Plus size={16} />
              {config.verb}
            </button>
            <button
              onClick={() => onAddToWishlist(shown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-nexus-border hover:border-nexus-accent text-sm font-medium rounded-lg transition-colors"
            >
              <BookmarkPlus size={16} />
              Wishlist
            </button>
          </div>
        </div>

        {loading && (
          <div className="absolute top-4 right-12">
            <Loader2 size={16} className="text-nexus-accent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
