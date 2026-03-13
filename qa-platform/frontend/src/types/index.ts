// ============================================================
// Auth Types
// ============================================================

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ============================================================
// Defect Types
// ============================================================

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type DefectStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Defect {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  module: string;
  status: DefectStatus;
  reporter: string | null;
  related_features: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface SimilarDefect extends Defect {
  similarity_score: number;
}

export interface DefectCreateRequest {
  title: string;
  description: string;
  severity: Severity;
  module: string;
  status?: DefectStatus;
  reporter?: string;
  related_features?: string[];
}

export interface DefectStats {
  total: number;
  with_embeddings: number;
  severity_distribution: Record<Severity, number>;
  status_distribution: Record<DefectStatus, number>;
  module_distribution: Record<string, number>;
}

// ============================================================
// Analysis Types
// ============================================================

export interface SimilarDefectsRequest {
  query: string;
  module?: string;
  top_k?: number;
}

export interface ImpactAnalysisRequest {
  query: string;
  module?: string;
  similar_defects?: SimilarDefect[];
}

export interface ImpactResult {
  impact_score: number;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  affected_areas: string[];
  potential_side_effects: string[];
  severity_distribution: Record<Severity, number>;
  recommendation: string;
}

export interface TestCaseRequest {
  query: string;
  module?: string;
  similar_defects?: SimilarDefect[];
  num_cases?: number;
}

export type TestCasePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TestCaseType = 'Functional' | 'Integration' | 'Regression' | 'E2E' | 'Performance';

export interface TestCase {
  id: number | null;
  title: string;
  description: string;
  steps: string[];
  expected_result: string;
  priority: TestCasePriority;
  test_type: TestCaseType;
  module: string | null;
  tags: string[];
}

// ============================================================
// Analysis History
// ============================================================

export interface AnalysisHistoryItem {
  id: number;
  query_description: string;
  query_module: string | null;
  impact_score: number;
  risk_level: string;
  affected_areas: string[];
  potential_side_effects: string[];
  similar_defect_ids: number[];
  similarity_scores: number[];
  test_case_ids: number[];
  created_at: string | null;
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardStats {
  total_defects: number;
  total_analyses: number;
  avg_impact_score: number;
  high_risk_count: number;
}

// ============================================================
// Upload Types
// ============================================================

export interface UploadResult {
  message: string;
  created: number;
  skipped: number;
  errors: string[];
}
