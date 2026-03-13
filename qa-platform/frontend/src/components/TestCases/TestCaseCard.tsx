import { useState } from 'react';
import { TestCase } from '../../types';
import { SeverityBadge, TagBadge } from '../UI/Badge';
import { LoadingSpinner, Skeleton } from '../UI/LoadingSpinner';
import { ChevronDown, ChevronUp, CheckSquare, AlertCircle, FlaskConical } from 'lucide-react';
import { clsx } from 'clsx';

interface TestCaseListProps {
  testCases: TestCase[];
  isLoading: boolean;
  error?: string | null;
}

export function TestCaseList({ testCases, isLoading, error }: TestCaseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton lines={3} />
          </div>
        ))}
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

  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
          <FlaskConical size={20} className="text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">생성된 테스트케이스가 없습니다</p>
        <p className="text-xs text-slate-500">분석을 실행하면 AI 추천 테스트케이스가 생성됩니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {testCases.map((tc, index) => (
        <TestCaseCard key={tc.id ?? index} testCase={tc} index={index + 1} />
      ))}
    </div>
  );
}

interface TestCaseCardProps {
  testCase: TestCase;
  index: number;
}

export default function TestCaseCard({ testCase, index }: TestCaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColorMap: Record<string, string> = {
    Critical: 'border-l-red-500',
    High: 'border-l-orange-500',
    Medium: 'border-l-yellow-500',
    Low: 'border-l-green-500',
  };

  const typeColorMap: Record<string, string> = {
    Functional: 'text-blue-400 bg-blue-400/10',
    Integration: 'text-purple-400 bg-purple-400/10',
    Regression: 'text-orange-400 bg-orange-400/10',
    E2E: 'text-green-400 bg-green-400/10',
    Performance: 'text-yellow-400 bg-yellow-400/10',
  };

  const borderColor = priorityColorMap[testCase.priority] || 'border-l-slate-500';
  const typeColor = typeColorMap[testCase.test_type] || 'text-slate-400 bg-slate-400/10';

  return (
    <div
      className={clsx(
        'bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg border-l-4 transition-all duration-200 animate-slide-up',
        borderColor
      )}
    >
      {/* Header */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* TC number */}
        <div className="flex-shrink-0 w-6 h-6 rounded bg-slate-700 flex items-center justify-center mt-0.5">
          <span className="text-xs font-bold text-slate-400">TC{index}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 leading-snug">
            {testCase.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <SeverityBadge severity={testCase.priority} size="sm" />
            <span className={clsx('text-xs px-2 py-0.5 rounded-md font-medium', typeColor)}>
              {testCase.test_type}
            </span>
            {testCase.module && (
              <span className="text-xs text-slate-500">{testCase.module}</span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-slate-500">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          {/* Description */}
          {testCase.description && (
            <p className="text-xs text-slate-400 mt-3 mb-3 leading-relaxed">
              {testCase.description}
            </p>
          )}

          {/* Test Steps */}
          {testCase.steps && testCase.steps.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                테스트 단계
              </h5>
              <ol className="space-y-2">
                {testCase.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-semibold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Expected Result */}
          {testCase.expected_result && (
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                기대 결과
              </h5>
              <div className="flex items-start gap-2 bg-green-500/5 border border-green-500/20 rounded-lg p-2.5">
                <CheckSquare size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">{testCase.expected_result}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {testCase.tags && testCase.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {testCase.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
