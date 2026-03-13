import { ImpactResult } from '../../types';
import { ImpactGauge, ProgressBar } from '../UI/ProgressBar';
import { RiskBadge } from '../UI/Badge';
import { LoadingSpinner, Skeleton } from '../UI/LoadingSpinner';
import { AlertTriangle, MapPin, Zap, Info, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ImpactVisualizationProps {
  result: ImpactResult | null;
  isLoading: boolean;
  error?: string | null;
}

export default function ImpactVisualization({ result, isLoading, error }: ImpactVisualizationProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center py-4">
          <LoadingSpinner size="lg" label="영향도 점수 계산 중..." />
        </div>
        <Skeleton lines={3} />
        <Skeleton lines={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
          <Zap size={20} className="text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">영향도 분석 결과가 없습니다</p>
        <p className="text-xs text-slate-500">분석을 실행하면 영향도 점수와 영향 영역이 표시됩니다</p>
      </div>
    );
  }

  const { impact_score, risk_level, affected_areas, potential_side_effects, severity_distribution, recommendation } = result;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Impact Gauge */}
      <div className="flex flex-col items-center py-2">
        <ImpactGauge score={impact_score} />
      </div>

      {/* Severity Distribution */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          심각도 분포
        </h4>
        <div className="space-y-2">
          {Object.entries(severity_distribution).map(([severity, count]) => {
            const totalDefects = Object.values(severity_distribution).reduce((a, b) => a + b, 0);
            const percentage = totalDefects > 0 ? (count / totalDefects) * 100 : 0;

            return (
              <div key={severity} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-14 flex-shrink-0">{severity}</span>
                <div className="flex-1">
                  <ProgressBar
                    value={percentage}
                    showValue={false}
                    color={
                      severity === 'Critical' ? 'red' :
                      severity === 'High' ? 'orange' :
                      severity === 'Medium' ? 'yellow' : 'green'
                    }
                    size="sm"
                  />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right flex-shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Affected Areas */}
      {affected_areas.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin size={12} />
            영향 영역
          </h4>
          <div className="flex flex-wrap gap-2">
            {affected_areas.map((area) => (
              <span
                key={area}
                className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Potential Side Effects */}
      {potential_side_effects.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-yellow-400" />
            잠재적 사이드 이펙트
          </h4>
          <div className="space-y-2">
            {potential_side_effects.map((effect, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-slate-400 bg-slate-700/30 rounded-lg p-2.5"
              >
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">⚠</span>
                <span>{effect}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
