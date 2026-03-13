import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { defectService } from '../services/defectService';
import { analysisService } from '../services/analysisService';
import { useAuthStore } from '../store/authStore';
import { StatCard } from '../components/UI/Card';
import { LoadingSpinner, Skeleton } from '../components/UI/LoadingSpinner';
import { RiskBadge, SeverityBadge } from '../components/UI/Badge';
import { formatRelativeTime, formatImpactScore } from '../utils/formatters';
import {
  Bug,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Database,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['defect-stats'],
    queryFn: () => defectService.getStats(),
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: () => analysisService.getHistory(0, 10),
  });

  const { data: recentDefects = [], isLoading: defectsLoading } = useQuery({
    queryKey: ['recent-defects'],
    queryFn: () => defectService.getDefects({ limit: 5 }),
  });

  const severityChartData = stats
    ? Object.entries(stats.severity_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const moduleChartData = stats
    ? Object.entries(stats.module_distribution)
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))
    : [];

  const avgImpactScore =
    history.length > 0
      ? history.reduce((sum, h) => sum + (h.impact_score || 0), 0) / history.length
      : 0;

  const highRiskCount = history.filter(
    (h) => h.risk_level === 'Critical' || h.risk_level === 'High'
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div>
        <h2 className="text-xl font-bold text-slate-200">
          Welcome back, {user?.username} 👋
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Here's an overview of your QA analysis activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Defects"
          value={statsLoading ? '...' : (stats?.total ?? 0)}
          subtitle="In database"
          icon={<Bug size={20} />}
          color="red"
        />
        <StatCard
          label="Total Analyses"
          value={historyLoading ? '...' : history.length}
          subtitle="All time"
          icon={<Zap size={20} />}
          color="indigo"
        />
        <StatCard
          label="Avg Impact Score"
          value={historyLoading ? '...' : formatImpactScore(avgImpactScore)}
          subtitle="Across analyses"
          icon={<TrendingUp size={20} />}
          color="yellow"
        />
        <StatCard
          label="High Risk Analyses"
          value={historyLoading ? '...' : highRiskCount}
          subtitle="Critical or High risk"
          icon={<AlertTriangle size={20} />}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity distribution chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Severity Distribution</h3>
          </div>
          {statsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : severityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={severityChartData} barSize={40}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SEVERITY_COLORS[entry.name] || '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No defect data yet
            </div>
          )}
        </div>

        {/* Module distribution chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Top Modules by Defects</h3>
          </div>
          {statsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : moduleChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={moduleChartData} barSize={32} layout="vertical">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No module data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent analyses + Recent defects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent analyses */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">Recent Analyses</h3>
            </div>
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
            >
              New Analysis <ArrowRight size={12} />
            </button>
          </div>

          {historyLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} lines={2} />)}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-slate-400">No analyses yet</p>
              <button
                onClick={() => navigate('/analysis')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Run your first analysis →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="px-6 py-3 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-300 line-clamp-1 flex-1">
                      {item.query_description}
                    </p>
                    <RiskBadge riskLevel={item.risk_level} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">
                      Score: {formatImpactScore(item.impact_score)}
                    </span>
                    {item.query_module && (
                      <span className="text-xs text-slate-600">{item.query_module}</span>
                    )}
                    <span className="text-xs text-slate-600 ml-auto">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent defects */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Bug size={15} className="text-red-400" />
              <h3 className="text-sm font-semibold text-slate-200">Recent Defects</h3>
            </div>
            <button
              onClick={() => navigate('/defects')}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {defectsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} lines={2} />)}
            </div>
          ) : recentDefects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-slate-400">No defects yet</p>
              <button
                onClick={() => navigate('/defects')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Upload defects →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {recentDefects.map((defect) => (
                <div key={defect.id} className="px-6 py-3 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-300 line-clamp-1 flex-1">
                      {defect.title}
                    </p>
                    <SeverityBadge severity={defect.severity} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{defect.module}</span>
                    <span className="text-xs text-slate-600 ml-auto">
                      {formatRelativeTime(defect.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
