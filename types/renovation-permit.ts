export type RenovationPermitStatus = "pending" | "approved" | "rejected";

export interface RenovationPermitDocument {
  created_at: string;
  file_name: string;
  file_size: number;
  id: string;
  mime_type: string;
}

export interface RenovationPermit {
  contractor_phone: string;
  contractor_pic_name: string;
  created_at: string;
  description: string;
  documents: RenovationPermitDocument[];
  estimated_end_date: string;
  has_result: boolean;
  id: string;
  material_vehicle: string;
  rejection_reason: string | null;
  renovation_level?: string;
  resident_name: string;
  result_file_name: string | null;
  reviewed_at: string | null;
  start_date: string;
  status: RenovationPermitStatus;
  submitted_by_resident_user_id: string;
  terms_agreed: boolean;
  unit_code: string;
  unit_id: string;
  updated_at: string;
  work_hours: string;
  worker_count: number;
  workspace_id: string;
}

export interface GetRenovationPermitsParams {
  status?: RenovationPermitStatus;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface RejectRenovationPermitPayload {
  reason: string;
}
