export type IssueType = 'garbage_accumulation' | 'overflowing_bin' | 'construction_debris' | 'pothole';

export interface Complaint {
  id: number;
  complaint_number: string;
  issue_type: IssueType;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  created_at: string;
  assigned_worker_id?: number;
  service_area?: string;
  worker_acknowledged_at?: string;
}

export interface Evidence {
  id: number;
  complaint_id: number;
  type: 'BEFORE' | 'AFTER' | 'WORK_PROOF' | 'FIELD_INSPECTION';
  file_path: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  quality_score?: number;
}

export interface ComplaintCreateInput {
  issue_type: IssueType;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
}
