import { useState, useRef, type FormEvent } from 'react';
import { X, Calendar, Star, Tag } from 'lucide-react';
import type { NormalizedMedia } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';
import { MediaIcon } from '@/components/MediaIcon';

interface LogMediaModalProps {
  media: NormalizedMedia;
  initialData?: {
    consumedAt: string;
    rating: number | null;
    note: string;
    tags: string[];
    isRewatch: boolean;
  };
  existingTags?: string[];
  onClose: () => void;
  onSubmit: (data: {
    consumedAt: string;
    rating: number | null;
    note: string;
    tags: string[];
    isRewatch: boolean;
  }) => void;
}

export function LogMediaModal({ media, initialData, existingTags = [], onClose, onSubmit }: LogMediaModalProps) {
  const config = MEDIA_CONFIG[media.type];
  const today = new Date().toISOString().split('T')[0];

  const [consumedAt, setConsumedAt] = useState(initialData?.consumedAt || today);
  const [rating, setRating] = useState<number | null>(initialData?.rating ?? null);
  const [note, setNote] = useState(initialData?.note || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRewatch, setIsRewatch] = useState(initialData?.isRewatch || false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const suggestions = existingTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && tagInput.length > 0 && !tags.includes(t)
  );

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    setShowSuggestions(false);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const finalTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags;
    onSubmit({ consumedAt, rating, note, tags: finalTags, isRewatch });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-nexus-surface border border-nexus-border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-nexus-border sticky top-0 bg-nexus-surface">
          <div className="flex items-start gap-3 flex-1">
            {media.posterUrl ? (
              <img
                src={media.posterUrl}
                alt={media.title}
                className="w-12 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-16 bg-nexus-bg rounded flex items-center justify-center">
                <MediaIcon type={media.type} size={20} />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">{media.title}</h3>
              <p className="text-sm text-nexus-text-muted">
                {media.year} • {config.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-nexus-text-muted hover:text-nexus-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={consumedAt}
              onChange={(e) => setConsumedAt(e.target.value)}
              max={today}
              required
              className="w-full px-4 py-2.5 bg-nexus-bg border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Star size={16} className="inline mr-2" />
              Note (sur 10)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(rating === value ? null : value)}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                    rating && value <= rating
                      ? 'bg-nexus-accent text-white'
                      : 'bg-nexus-bg text-nexus-text-muted hover:bg-nexus-surface-hover'
                  }`}
                  style={
                    rating && value <= rating
                      ? { backgroundColor: config.color }
                      : undefined
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Note personnelle (optionnel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ton avis, tes impressions..."
              rows={3}
              className="w-full px-4 py-2.5 bg-nexus-bg border border-nexus-border rounded-lg focus:outline-none focus:border-nexus-accent text-nexus-text placeholder:text-nexus-text-muted resize-none"
            />
          </div>

          {/* Tags */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              <Tag size={14} className="inline mr-1" />
              Tags
            </label>
            <div
              className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 bg-nexus-bg border border-nexus-border rounded-lg focus-within:border-nexus-accent cursor-text"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 bg-nexus-surface rounded text-sm text-nexus-text"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    className="text-nexus-text-muted hover:text-nexus-text"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={tags.length === 0 ? 'coup de cœur, nostalgie...' : ''}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-nexus-text placeholder:text-nexus-text-muted"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-nexus-surface border border-nexus-border rounded-lg shadow-lg overflow-hidden">
                {suggestions.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addTag(s)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-nexus-surface-hover transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rewatch */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRewatch}
              onChange={(e) => setIsRewatch(e.target.checked)}
              className="w-4 h-4 rounded border-nexus-border accent-nexus-accent"
            />
            <span className="text-sm">C'est une revisite / relecture</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-nexus-border hover:bg-nexus-surface-hover rounded-lg text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-nexus-accent hover:bg-nexus-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: config.color }}
            >
              {initialData ? 'Modifier' : 'Ajouter au journal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
