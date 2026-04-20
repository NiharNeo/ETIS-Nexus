import type { EventStatus, ClubStatus, EventMode } from '../../types';

interface StatusBadgeProps {
  status: EventStatus | ClubStatus;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_DOTS: Record<string, string> = {
  draft: 'bg-slate-400',
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClass = `inline-flex items-center gap-1.5 rounded-full capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? '11px' : '12px';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={`${baseClass} ${sizeClass}`} style={{ fontSize, fontWeight: 600 }}>
      <span className={`${dotSize} rounded-full flex-shrink-0 ${STATUS_DOTS[status] ?? 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

interface ModeBadgeProps {
  mode: EventMode;
  size?: 'sm' | 'md';
}

const MODE_STYLES: Record<EventMode, string> = {
  online: 'bg-blue-100 text-blue-700',
  offline: 'bg-purple-100 text-purple-700',
  hybrid: 'bg-teal-100 text-teal-700',
};

export function ModeBadge({ mode, size = 'md' }: ModeBadgeProps) {
  const icons: Record<EventMode, string> = {
    online: '🌐',
    offline: '📍',
    hybrid: '🔀',
  };
  const sizeClass = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full capitalize ${MODE_STYLES[mode]} ${sizeClass}`}
      style={{ fontSize, fontWeight: 600 }}
    >
      <span>{icons[mode]}</span>
      {mode}
    </span>
  );
}
