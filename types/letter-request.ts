export type LetterRequestStatus = "pending" | "approved" | "rejected";

export interface LetterRequestAttachment {
  created_at: string;
  file_name: string;
  file_size: number;
  id: string;
  mime_type: string;
}

export interface LetterRequest {
  attachments: LetterRequestAttachment[];
  created_at: string;
  has_result: boolean;
  id: string;
  reason: string | null;
  rejection_reason: string | null;
  resident_name: string;
  result_file_name: string | null;
  reviewed_at: string | null;
  status: LetterRequestStatus;
  subject: string;
  submitted_by_resident_user_id: string;
  unit_code: string;
  unit_id: string;
  updated_at: string;
  workspace_id: string;
}

export interface GetLetterRequestsParams {
  status?: LetterRequestStatus;
  unit_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface RejectLetterRequestPayload {
  reason: string;
}
