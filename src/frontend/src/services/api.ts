import axios from 'axios';
import { Complaint, ComplaintCreateInput, Evidence } from '../types/complaint';

const API_BASE = '/api/v1';

export const API_ORIGIN = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({ baseURL: API_ORIGIN });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mcc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AppUser { id: number; name: string; email: string; role: 'PUBLIC' | 'WORKER' | 'ADMIN'; service_area?: string; }

export const authApi = {
  signup: (data: { name: string; email: string; password: string; role: 'PUBLIC' | 'WORKER'; service_area?: string }) =>
    api.post('/api/v1/auth/signup', data).then(res => res.data),
  login: (data: { email: string; password: string }) => api.post('/api/v1/auth/login', data).then(res => res.data),
};

export const complaintApi = {
  dashboard: () => api.get(`${API_BASE}/complaints/dashboard`).then(res => res.data),
  create: (data: ComplaintCreateInput) =>
    api.post(`${API_BASE}/complaints`, data).then(res => res.data),

  list: () =>
    api.get(`${API_BASE}/complaints`).then(res => res.data),

  mine: () => api.get(`${API_BASE}/complaints/mine`).then(res => res.data),
  workerInbox: () => api.get(`${API_BASE}/complaints/worker/inbox`).then(res => res.data),
  acknowledge: (id: number) => api.post(`${API_BASE}/complaints/${id}/acknowledge`).then(res => res.data),
  workerStatus: (workerId: number) => api.get(`${API_BASE}/complaints/workers/${workerId}/complaints`).then(res => res.data),
  portalDetail: (id: number) => api.get(`${API_BASE}/complaints/${id}/portal`).then(res => res.data),

  get: (id: number) =>
    api.get(`${API_BASE}/complaints/${id}`).then(res => res.data),

  uploadEvidence: (id: number, file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evidence_metadata', JSON.stringify(metadata));
    return api.post(`${API_BASE}/complaints/${id}/evidence`, formData).then(res => res.data);
  },

  getEvidence: (id: number) =>
    api.get(`${API_BASE}/complaints/${id}/evidence`).then(res => res.data),

  deleteEvidence: (id: number, evidenceId: number) =>
    api.delete(`${API_BASE}/complaints/${id}/evidence/${evidenceId}`).then(res => res.data),

  verify: (id: number) =>
    api.post(`${API_BASE}/complaints/${id}/verify`).then(res => res.data),

  getComparison: (id: number) =>
    api.get(`${API_BASE}/complaints/${id}/comparison`).then(res => res.data),

  submitDecision: (data: { comparison_id: number; reviewer_id: number; decision: string; reason: string }) =>
    api.post(`${API_BASE}/verification-human/decision`, data).then(res => res.data),
};

export const evidenceUrl = (filePath: string) => {
  const normalized = filePath.replace(/\\/g, '/');
  const marker = '/uploads/';
  const index = normalized.toLowerCase().lastIndexOf(marker);
  const relative = index >= 0 ? normalized.slice(index + marker.length) : normalized.replace(/^uploads\//i, '');
  return `${API_ORIGIN}/uploads/${relative.split('/').map(encodeURIComponent).join('/')}`;
};
