export interface Complaint {
  category: string;
  created_at: string;
  description: string;
  has_photo: boolean;
  id: string;
  photo_file_name: string | null;
  resident_name: string;
  responded_at: string | null;
  responded_by_user_id: string | null;
  response: string | null;
  status: "open" | "in_progress" | "resolved" | "rejected" | "closed" | string;
  submitted_by_resident_user_id: string;
  title: string;
  unit_code: string;
  unit_id: string;
  updated_at: string;
  urgency: "low" | "medium" | "high" | string;
  workspace_id: string;
}

export interface GetComplaintsParams {
  status?: string;
  category?: string;
  urgency?: string;
  unit_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UpdateComplaintPayload {
  response?: string;
  status?: string;
}
