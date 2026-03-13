import { useState } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { analysisService } from '../services/analysisService';
import BugListComponent from '../components/DefectList/BugListComponent';
import ImpactVisualization from '../components/Analysis/ImpactVisualization';
import { TestCaseList } from '../components/TestCases/TestCaseCard';
import { Zap, Bug, FlaskConical, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const MODULES = [
  'Login', 'Payment', 'Search', 'Cart', 'Order',
  'User Profile', 'Notification', 'Report', 'Dashboard', 'API Gateway',
];

export default function ImpactAnalysisPage() {
  const store = useAnalysisStore();
  const [numTestCases, setNumTestCases] = useState(5);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const isAnyLoading = store.isLoadingSimilar || store.isLoadingImpact || store.isLoadingTestCases;

  const handleModuleToggle = (module: string) => {
    if (store.currentModule === module) {
      store.setModule(null);
    } else {
      store.setModule(module);
    }
  };

  const handleAnalyze = async () => {
    if (!store.currentQuery.trim()) {
      toast.error('Please enter a change description');
      return;
    }

    store.resetResults();
    setHasAnalyzed(true);

    const query = store.currentQuery;
    const module = store.currentModule || undefined;

    // Step 1: Find similar defects
    store.setLoadingSimilar(true);
    store.setErrorSimilar(null);
    let similarDefects: typeof store.similarDefects = [];

    try {
      similarDefects = await analysisService.findSimilarDefects({
        query,
        module,
        top_k: 10,
      });
      store.setSimilarDefects(similarDefects);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to find similar defects';
      store.setErrorSimilar(msg);
      toast.error(msg);
    } finally {
      store.setLoadingSimilar(false);
    }

    // Step 2: Analyze impact (using similar defects we just fetched)
    store.setLoadingImpact(true);
    store.setErrorImpact(null);

    try {
      const impact = await analysisService.analyzeImpact({
        query,
        module,
        similar_defects: similarDefects,
      });
      store.setImpactResult(impact);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to analyze impact';
      store.setErrorImpact(msg);
      toast.error(msg);
    } finally {
      store.setLoadingImpact(false);
    }

    // Step 3: Generate test cases
    store.setLoadingTestCases(true);
    store.setErrorTestCases(null);

    try {
      const testCases = await analysisService.generateTestCases({
        query,
        module,
        similar_defects: similarDefects,
        num_cases: numTestCases,
      });
      store.setTestCases(testCases);
      toast.success(`Analysis complete! Found ${similarDefects.length} similar defects and generated ${testCases.length} test cases.`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to generate test cases';
      store.setErrorTestCases(msg);
      toast.error(msg);
    } finally {
      store.setLoadingTestCases(false);
    }
  };

  const handleClear = () => {
    store.setQuery('');
    store.setModule(null);
    store.resetResults();
    setHasAnalyzed(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Input Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-200 mb-4">Describe Your Change</h2>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            value={store.currentQuery}
            onChange={(e) => store.setQuery(e.target.value)}
            placeholder="Describe the software change or feature you're implementing... e.g., '로그인 페이지 UI 개편 및 소셜 로그인 추가 (Login page UI redesign and adding social login)'"
            className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
            rows={4}
            disabled={isAnyLoading}
          />
          {store.currentQuery && (
            <button
              onClick={() => store.setQuery('')}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Module selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Filter by Module (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((module) => (
              <button
                key={module}
                onClick={() => handleModuleToggle(module)}
                disabled={isAnyLoading}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-full border transition-all duration-150',
                  store.currentModule === module
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50'
                    : 'text-slate-400 border-slate-600 hover:border-slate-500 hover:text-slate-300'
                )}
              >
                {module}
              </button>
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-4">
          {/* Num test cases */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Test cases:</label>
            <select
              value={numTestCases}
              onChange={(e) => setNumTestCases(Number(e.target.value))}
              className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isAnyLoading}
            >
              {[3, 5, 7, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          {/* Clear button */}
          {hasAnalyzed && (
            <button
              onClick={handleClear}
              disabled={isAnyLoading}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Clear
            </button>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnyLoading || !store.currentQuery.trim()}
            className={clsx(
              'flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200',
              'bg-indigo-600 hover:bg-indigo-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isAnyLoading && 'animate-pulse'
            )}
          >
            <Zap size={16} />
            {isAnyLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Results Section - 3 columns */}
      {(hasAnalyzed || store.similarDefects.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Similar Defects */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700">
              <Bug size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold text-slate-200">Similar Defects</h3>
              {store.similarDefects.length > 0 && (
                <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                  {store.similarDefects.length}
                </span>
              )}
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <BugListComponent
                defects={store.similarDefects}
                isLoading={store.isLoadingSimilar}
                error={store.errorSimilar}
              />
            </div>
          </div>

          {/* Column 2: Impact Analysis */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700">
              <Zap size={16} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-200">Impact Analysis</h3>
              {store.impactResult && (
                <span className={clsx(
                  'ml-auto text-xs px-2 py-0.5 rounded-full border font-semibold',
                  store.impactResult.risk_level === 'Critical' && 'bg-red-500/20 text-red-400 border-red-500/30',
                  store.impactResult.risk_level === 'High' && 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                  store.impactResult.risk_level === 'Medium' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                  store.impactResult.risk_level === 'Low' && 'bg-green-500/20 text-green-400 border-green-500/30',
                )}>
                  {store.impactResult.risk_level}
                </span>
              )}
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <ImpactVisualization
                result={store.impactResult}
                isLoading={store.isLoadingImpact}
                error={store.errorImpact}
              />
            </div>
          </div>

          {/* Column 3: Test Cases */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700">
              <FlaskConical size={16} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">Recommended Tests</h3>
              {store.testCases.length > 0 && (
                <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {store.testCases.length}
                </span>
              )}
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <TestCaseList
                testCases={store.testCases}
                isLoading={store.isLoadingTestCases}
                error={store.errorTestCases}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty state (before first analysis) */}
      {!hasAnalyzed && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4">
            <Zap size={28} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Start Impact Analysis</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Describe your change or feature above and click Analyze to find similar defects,
            calculate impact score, and get AI-recommended test cases.
          </p>
        </div>
      )}
    </div>
  );
}
