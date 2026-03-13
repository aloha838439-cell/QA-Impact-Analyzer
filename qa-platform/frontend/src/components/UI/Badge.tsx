import { Severity } from '../../types';
import { getSeverityColorClass } from '../../utils/formatters';
import { clsx } from 'clsx';

interface BadgeProps {
  severity: Severity | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SeverityBadge({ severity, size = 'md', className }: BadgeProps) {
  const colorClass = getSeverityColorClass(severity);
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        colorClass,
        sizeClass,
        className
      )}
    >
      {severity}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    Open: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    'In Progress': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    Resolved: 'text-green-400 bg-green-400/10 border-green-400/30',
    Closed: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
  };

  const colorClass = colorMap[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/30';

  return (
    <span
      className={clsx(
        'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border',
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}

interface RiskBadgeProps {
  riskLevel: string;
  className?: string;
}

export function RiskBadge({ riskLevel, className }: RiskBadgeProps) {
  const colorMap: Record<string, string> = {
    Critical: 'text-red-400 bg-red-400/10 border-red-400/30',
    High: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    Low: 'text-green-400 bg-green-400/10 border-green-400/30',
  };

  const colorClass = colorMap[riskLevel] || 'text-slate-400 bg-slate-400/10 border-slate-400/30';

  return (
    <span
      className={clsx(
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border',
        colorClass,
        className
      )}
    >
      {riskLevel} Risk
    </span>
  );
}

interface TagBadgeProps {
  tag: string;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md',
        'text-indigo-400 bg-indigo-400/10 border border-indigo-400/20',
        className
      )}
    >
      #{tag}
    </span>
  );
}
