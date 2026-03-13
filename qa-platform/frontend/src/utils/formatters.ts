import { Severity } from '../types';

/**
 * Format a date string into a human-readable format.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return '방금 전';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}분 전`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}시간 전`;
    if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)}일 전`;
    return formatDate(dateString);
  } catch {
    return dateString || 'N/A';
  }
}

/**
 * Format a similarity score as a percentage string.
 */
export function formatSimilarity(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Format an impact score with one decimal place.
 */
export function formatImpactScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Get CSS color class for a severity level.
 */
export function getSeverityColorClass(severity: Severity | string): string {
  switch (severity) {
    case 'Critical':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'High':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'Medium':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'Low':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
}

/**
 * Get CSS color class for a risk level.
 */
export function getRiskColorClass(riskLevel: string): string {
  switch (riskLevel) {
    case 'Critical':
      return 'text-red-400';
    case 'High':
      return 'text-orange-400';
    case 'Medium':
      return 'text-yellow-400';
    case 'Low':
      return 'text-green-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get progress bar color class for impact score.
 */
export function getImpactScoreColor(score: number): string {
  if (score >= 75) return 'bg-red-500';
  if (score >= 50) return 'bg-orange-500';
  if (score >= 25) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format file size in human-readable format.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Convert a string to title case.
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}
