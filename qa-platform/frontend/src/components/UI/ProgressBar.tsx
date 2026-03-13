import { clsx } from 'clsx';
import { getImpactScoreColor } from '../../utils/formatters';

interface ProgressBarProps {
  value: number;       // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'indigo' | 'green' | 'yellow' | 'orange' | 'red' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'auto',
  size = 'md',
  className,
  animated = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorMap = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    auto: getImpactScoreColor(percentage),
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const barColor = colorMap[color];

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-slate-300">
              {value.toFixed(1)}{max !== 100 ? `/${max}` : ''}
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full bg-slate-700 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            barColor,
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

interface ImpactGaugeProps {
  score: number;  // 0-100
  className?: string;
}

export function ImpactGauge({ score, className }: ImpactGaugeProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const rotation = (normalizedScore / 100) * 180 - 90; // -90 to 90 degrees

  const getColor = (s: number) => {
    if (s >= 75) return '#ef4444'; // red
    if (s >= 50) return '#f97316'; // orange
    if (s >= 25) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const getRiskLabel = (s: number) => {
    if (s >= 75) return 'Critical';
    if (s >= 50) return 'High';
    if (s >= 25) return 'Medium';
    return 'Low';
  };

  const color = getColor(normalizedScore);
  const riskLabel = getRiskLabel(normalizedScore);

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {/* SVG Gauge */}
      <svg viewBox="0 0 200 120" className="w-48 h-28">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#334155"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Colored progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(normalizedScore / 100) * 251.3} 251.3`}
          style={{ transition: 'stroke-dasharray 1s ease-out, stroke 0.5s ease' }}
        />
        {/* Needle */}
        <g transform={`rotate(${rotation}, 100, 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="5" fill={color} />
        </g>
        {/* Score text */}
        <text
          x="100"
          y="116"
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {normalizedScore.toFixed(0)}
        </text>
      </svg>

      {/* Labels */}
      <div className="flex justify-between w-full text-xs text-slate-500 px-2 -mt-1">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>

      {/* Risk level badge */}
      <div
        className="mt-2 px-3 py-1 rounded-full text-xs font-semibold border"
        style={{
          color,
          backgroundColor: `${color}1a`,
          borderColor: `${color}4d`,
        }}
      >
        {riskLabel} Risk
      </div>
    </div>
  );
}
