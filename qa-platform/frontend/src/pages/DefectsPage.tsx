import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defectService } from '../services/defectService';
import { Defect, Severity } from '../types';
import { SeverityBadge, StatusBadge } from '../components/UI/Badge';
import { LoadingSpinner, Skeleton } from '../components/UI/LoadingSpinner';
import { formatRelativeTime, truncate } from '../utils/formatters';
import {
  Upload,
  Search,
  Bug,
  RefreshCw,
  Database,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const SEVERITY_OPTIONS: (Severity | '')[] = ['', 'Critical', 'High', 'Medium', 'Low'];

export default function DefectsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Fetch defects
  const { data: defects = [], isLoading, refetch } = useQuery({
    queryKey: ['defects', { search, severity: severityFilter, module: moduleFilter }],
    queryFn: () =>
      defectService.getDefects({
        search: search || undefined,
        severity: severityFilter || undefined,
        module: moduleFilter || undefined,
        limit: 100,
      }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['defect-stats'],
    queryFn: () => defectService.getStats(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => defectService.uploadCSV(file),
    onSuccess: (result) => {
      toast.success(`${result.message}. Skipped: ${result.skipped}`);
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['defect-stats'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Upload failed';
      toast.error(msg);
    },
  });

  // Seed mutation
  const seedMutation = useMutation({
    mutationFn: () => defectService.seedDefects(),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['defect-stats'] });
    },
    onError: () => toast.error('Seeding failed'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      uploadMutation.mutate(file);
    } else {
      toast.error('Please drop a CSV file');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">Total Defects</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">With Embeddings</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.with_embeddings}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">Critical / High</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {(stats.severity_distribution?.Critical || 0) + (stats.severity_distribution?.High || 0)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">Open Issues</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {stats.status_distribution?.Open || 0}
            </p>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200',
          isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-600'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          {uploadMutation.isPending ? (
            <LoadingSpinner size="lg" label="Processing CSV..." />
          ) : (
            <>
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                <Upload size={20} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-300">Drop CSV file here or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  browse to upload
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Columns: title, description, severity, module, status, reporter, related_features
              </p>
            </>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search defects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Severity filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | '')}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">All Severities</option>
            {SEVERITY_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* Module filter */}
        <input
          type="text"
          placeholder="Filter by module..."
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
        />

        {/* Refresh */}
        <button
          onClick={() => refetch()}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>

        {/* Seed button */}
        <button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {seedMutation.isPending ? <LoadingSpinner size="sm" /> : <Database size={15} />}
          Seed Demo Data
        </button>
      </div>

      {/* Defects table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-slate-200">Defects</h3>
          </div>
          <span className="text-xs text-slate-500">{defects.length} records</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : defects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Bug size={32} className="text-slate-600" />
            <p className="text-slate-400 text-sm">No defects found</p>
            <p className="text-slate-500 text-xs">Upload a CSV or seed demo data to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Reporter
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {defects.map((defect: Defect) => (
                  <tr
                    key={defect.id}
                    className="hover:bg-slate-700/20 transition-colors duration-100"
                  >
                    <td className="px-6 py-3">
                      <p className="text-sm text-slate-200 font-medium">
                        {truncate(defect.title, 60)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                        {truncate(defect.description, 80)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={defect.severity} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-300">{defect.module}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={defect.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-400">{defect.reporter || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(defect.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
