import api from './api';
import { Defect, DefectCreateRequest, DefectStats, UploadResult } from '../types';

export interface DefectListParams {
  skip?: number;
  limit?: number;
  module?: string;
  severity?: string;
  search?: string;
}

export const defectService = {
  async getDefects(params: DefectListParams = {}): Promise<Defect[]> {
    const response = await api.get<Defect[]>('/api/defects', { params });
    return response.data;
  },

  async getDefect(id: number): Promise<Defect> {
    const response = await api.get<Defect>(`/api/defects/${id}`);
    return response.data;
  },

  async createDefect(data: DefectCreateRequest): Promise<Defect> {
    const response = await api.post<Defect>('/api/defects', data);
    return response.data;
  },

  async uploadCSV(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResult>('/api/defects/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getStats(): Promise<DefectStats> {
    const response = await api.get<DefectStats>('/api/defects/stats');
    return response.data;
  },

  async seedDefects(): Promise<{ message: string; total: number }> {
    const response = await api.post<{ message: string; total: number }>('/api/defects/seed');
    return response.data;
  },

  async deleteAll(): Promise<{ message: string; deleted: number }> {
    const response = await api.delete<{ message: string; deleted: number }>('/api/defects/all');
    return response.data;
  },
};
