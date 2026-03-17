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
  Trash2,
  Link,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const SEVERITY_OPTIONS: (Severity | '')[] = ['', 'Critical', 'High', 'Medium', 'Low'];

interface RedmineForm {
  baseUrl: string;
  apiKey: string;
  projectId: string;
  limit: number;
  statusId: string;
  backendUrl: string;
}

export default function DefectsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Redmine modal state
  const [showRedmineModal, setShowRedmineModal] = useState(false);
  const [redmineForm, setRedmineForm] = useState<RedmineForm>({
    baseUrl: '',
    apiKey: '',
    projectId: '',
    limit: 100,
    statusId: 'open',
    backendUrl: 'http://localhost:8004',
  });
  const [redmineProjects, setRedmineProjects] = useState<{ id: string; name: string }[]>([]);
  const [redmineConnected, setRedmineConnected] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

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
      toast.success(`${result.message}. 중복 건너뜀: ${result.skipped}`);
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
    onError: () => toast.error('시드 데이터 주입 실패'),
  });

  // Redmine import mutation
  const redmineMutation = useMutation({
    mutationFn: () => defectService.importFromRedmine({
      baseUrl: redmineForm.baseUrl,
      apiKey: redmineForm.apiKey,
      projectId: redmineForm.projectId || undefined,
      limit: redmineForm.limit,
      statusId: redmineForm.statusId,
      backendUrl: redmineForm.backendUrl,
    }),
    onSuccess: (result) => {
      toast.success(`${result.message}. 중복 건너뜀: ${result.skipped}`);
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['defect-stats'] });
      setShowRedmineModal(false);
      setRedmineConnected(false);
      setRedmineProjects([]);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || '가져오기 실패';
      toast.error(msg);
    },
  });

  const handleTestRedmine = async () => {
    setTestingConnection(true);
    try {
      const result = await defectService.testRedmineConnection(redmineForm.baseUrl, redmineForm.apiKey, redmineForm.backendUrl);
      setRedmineProjects(result.projects);
      setRedmineConnected(true);
      toast.success(`연결 성공! 프로젝트 ${result.projects.length}개 확인`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || '연결 실패';
      toast.error(msg);
      setRedmineConnected(false);
    } finally {
      setTestingConnection(false);
    }
  };

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: () => defectService.deleteAll(),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['defect-stats'] });
    },
    onError: () => toast.error('삭제 실패'),
  });

  const handleDeleteAll = () => {
    if (window.confirm('전체 결함 데이터를 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteAllMutation.mutate();
    }
  };

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
      toast.error('CSV 파일만 업로드 가능합니다');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">전체 결함</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">임베딩 보유</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.with_embeddings}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">심각 / 높음</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {(stats.severity_distribution?.Critical || 0) + (stats.severity_distribution?.High || 0)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400">미해결 건수</p>
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
                <p className="text-sm text-slate-300">CSV 파일을 드래그하거나</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  파일 선택해서 업로드
                </button>
              </div>
              <p className="text-xs text-slate-500">
                필수 컬럼: title, description, severity, module, status, reporter, related_features
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
            placeholder="결함 검색..."
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
            <option value="">전체 심각도</option>
            {SEVERITY_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* Module filter */}
        <input
          type="text"
          placeholder="모듈 필터..."
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

        {/* Redmine import button */}
        <button
          onClick={() => setShowRedmineModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-700/30 hover:bg-indigo-700/50 text-indigo-300 border border-indigo-700/40 rounded-lg text-sm transition-colors"
        >
          <Link size={15} />
          Redmine 가져오기
        </button>

        {/* Seed button */}
        <button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {seedMutation.isPending ? <LoadingSpinner size="sm" /> : <Database size={15} />}
          더미 데이터 주입
        </button>

        {/* Delete all button */}
        <button
          onClick={handleDeleteAll}
          disabled={deleteAllMutation.isPending || defects.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-lg text-sm transition-colors disabled:opacity-40"
        >
          {deleteAllMutation.isPending ? <LoadingSpinner size="sm" /> : <Trash2 size={15} />}
          전체 삭제
        </button>
      </div>

      {/* Defects table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-slate-200">결함 목록</h3>
          </div>
          <span className="text-xs text-slate-500">{defects.length}건</span>
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
            <p className="text-slate-400 text-sm">결함 데이터가 없습니다</p>
            <p className="text-slate-500 text-xs">CSV를 업로드하거나 더미 데이터를 주입하세요</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    심각도
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    모듈
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    보고자
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                    등록일
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
      {/* Redmine Modal */}
      {showRedmineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Link size={16} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200">Redmine 이슈 가져오기</h2>
              </div>
              <button
                onClick={() => { setShowRedmineModal(false); setRedmineConnected(false); setRedmineProjects([]); }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* 내부망 안내 */}
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg px-3 py-2.5 text-xs text-amber-300 space-y-1">
                <p className="font-medium">내부망 Redmine 연결 방법</p>
                <p>1. 백엔드를 로컬에서 실행: <code className="bg-slate-700 px-1 rounded">uvicorn src.main:app --port 8004</code></p>
                <p>2. 아래 "백엔드 URL"을 <code className="bg-slate-700 px-1 rounded">http://localhost:8004</code> 로 설정</p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">백엔드 URL</label>
                <input
                  type="text"
                  placeholder="http://localhost:8004"
                  value={redmineForm.backendUrl}
                  onChange={(e) => { setRedmineForm(f => ({ ...f, backendUrl: e.target.value })); setRedmineConnected(false); }}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">내부망: http://localhost:8004 · 외부망: 기본값(Vercel) 사용 시 비워두세요</p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Redmine URL</label>
                <input
                  type="text"
                  placeholder="http://your-redmine.com"
                  value={redmineForm.baseUrl}
                  onChange={(e) => { setRedmineForm(f => ({ ...f, baseUrl: e.target.value })); setRedmineConnected(false); }}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">API 키</label>
                <input
                  type="password"
                  placeholder="Redmine 계정 → 내 계정 → API 액세스 키"
                  value={redmineForm.apiKey}
                  onChange={(e) => { setRedmineForm(f => ({ ...f, apiKey: e.target.value })); setRedmineConnected(false); }}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Connection test */}
              <button
                onClick={handleTestRedmine}
                disabled={!redmineForm.baseUrl || !redmineForm.apiKey || testingConnection}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-40"
              >
                {testingConnection ? <LoadingSpinner size="sm" /> : redmineConnected ? <CheckCircle size={15} className="text-green-400" /> : <Link size={15} />}
                {testingConnection ? '연결 확인 중...' : redmineConnected ? '연결됨' : '연결 테스트'}
              </button>

              {redmineConnected && (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">프로젝트 (선택)</label>
                    <select
                      value={redmineForm.projectId}
                      onChange={(e) => setRedmineForm(f => ({ ...f, projectId: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">전체 프로젝트</option>
                      {redmineProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">상태</label>
                      <select
                        value={redmineForm.statusId}
                        onChange={(e) => setRedmineForm(f => ({ ...f, statusId: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="open">미해결 (open)</option>
                        <option value="closed">해결됨 (closed)</option>
                        <option value="*">전체</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-slate-400 mb-1">최대 건수</label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={redmineForm.limit}
                        onChange={(e) => setRedmineForm(f => ({ ...f, limit: Number(e.target.value) }))}
                        className="w-full bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => { setShowRedmineModal(false); setRedmineConnected(false); setRedmineProjects([]); }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => redmineMutation.mutate()}
                disabled={!redmineConnected || redmineMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                {redmineMutation.isPending ? <LoadingSpinner size="sm" /> : <Link size={15} />}
                {redmineMutation.isPending ? '가져오는 중...' : '가져오기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
