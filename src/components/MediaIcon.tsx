import { Film, Tv, BookOpen, Gamepad2, Music } from 'lucide-react';
import type { MediaType } from '@/types/media';
import { MEDIA_CONFIG } from '@/types/media';

interface MediaIconProps {
  type: MediaType;
  size?: number;
  className?: string;
}

const ICONS = {
  movie: Film,
  tv: Tv,
  book: BookOpen,
  game: Gamepad2,
  music: Music,
} as const;

export function MediaIcon({ type, size = 18, className = '' }: MediaIconProps) {
  const Icon = ICONS[type];
  const config = MEDIA_CONFIG[type];

  return <Icon size={size} style={{ color: config.color }} className={className} />;
}
