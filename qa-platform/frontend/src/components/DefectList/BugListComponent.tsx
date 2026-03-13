import { SimilarDefect } from '../../types';
import { SeverityBadge, StatusBadge } from '../UI/Badge';
import { LoadingSpinner, Skeleton } from '../UI/LoadingSpinner';
import { formatSimilarity, formatRelativeTime } from '../../utils/formatters';
import { AlertCircle, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

interface BugListComponentProps {
  defects: SimilarDefect[];
  isLoading: boolean;
  error?: string | null;
}

export default function BugListComponent({ defects, isLoading, error }: BugListComponentProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton lines={2} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (defects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
          <Link2 size={20} className="text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">No similar defects found</p>
        <p className="text-xs text-slate-500">Run analysis to find related historical defects</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {defects.map((defect, index) => (
        <DefectCard key={defect.id} defect={defect} rank={index + 1} />
      ))}
    </div>
  );
}

interface DefectCardProps {
  defect: SimilarDefect;
  rank: number;
}

function DefectCard({ defect, rank }: DefectCardProps) {
  const similarityPercent = defect.similarity_score * 100;

  const getSimilarityColor = (score: number) => {
    if (score >= 70) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (score >= 50) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  };

  const similarityColor = getSimilarityColor(similarityPercent);

  return (
    <div className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition-colors duration-200 animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        {/* Rank indicator */}
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center mt-0.5">
          <span className="text-xs font-bold text-slate-400">{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 mb-1.5">
            {defect.title}
          </h4>

          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={defect.severity} size="sm" />
            <StatusBadge status={defect.status} />
            <span className="text-xs text-slate-500">{defect.module}</span>
          </div>
        </div>

        {/* Similarity score */}
        <div
          className={clsx(
            'flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg border',
            similarityColor
          )}
        >
          {formatSimilarity(defect.similarity_score)}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2 ml-8 mb-2">
        {defect.description}
      </p>

      {/* Related features */}
      {defect.related_features && defect.related_features.length > 0 && (
        <div className="ml-8 flex flex-wrap gap-1">
          {defect.related_features.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-slate-500 rounded"
            >
              {feature}
            </span>
          ))}
          {defect.related_features.length > 4 && (
            <span className="text-xs text-slate-600">+{defect.related_features.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="ml-8 mt-2 flex items-center gap-3">
        <span className="text-xs text-slate-600">
          {defect.reporter && `By ${defect.reporter}`}
        </span>
        <span className="text-xs text-slate-600">
          {formatRelativeTime(defect.created_at)}
        </span>
      </div>

      {/* Similarity bar */}
      <div className="ml-8 mt-2">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              similarityPercent >= 70 ? 'bg-green-500' :
              similarityPercent >= 50 ? 'bg-yellow-500' : 'bg-slate-500'
            )}
            style={{ width: `${similarityPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
