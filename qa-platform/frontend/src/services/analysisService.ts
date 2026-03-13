import api from './api';
import {
  SimilarDefect,
  SimilarDefectsRequest,
  ImpactAnalysisRequest,
  ImpactResult,
  TestCaseRequest,
  TestCase,
  AnalysisHistoryItem,
} from '../types';

export const analysisService = {
  async findSimilarDefects(request: SimilarDefectsRequest): Promise<SimilarDefect[]> {
    const response = await api.post<SimilarDefect[]>('/api/analysis/similar-defects', request);
    return response.data;
  },

  async analyzeImpact(request: ImpactAnalysisRequest): Promise<ImpactResult> {
    const response = await api.post<ImpactResult>('/api/analysis/impact', request);
    return response.data;
  },

  async generateTestCases(request: TestCaseRequest): Promise<TestCase[]> {
    const response = await api.post<TestCase[]>('/api/analysis/test-cases', request);
    return response.data;
  },

  async getHistory(skip = 0, limit = 20): Promise<AnalysisHistoryItem[]> {
    const response = await api.get<AnalysisHistoryItem[]>('/api/analysis/history', {
      params: { skip, limit },
    });
    return response.data;
  },
};
