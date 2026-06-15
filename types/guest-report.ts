export interface GuestReport {
  created_at: string;
  duration_days: number;
  guest_name: string;
  has_ktp: boolean;
  id: string;
  ktp_file_name: string | null;
  is_menginap: boolean;
  notes: string | null;
  operator_note: string | null;
  resident_name: string;
  submitted_by_resident_user_id: string;
  unit_code: string;
  unit_id: string;
  updated_at: string;
  visit_date: string;
  workspace_id: string;
}

export interface GetGuestReportsParams {
  unit_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
