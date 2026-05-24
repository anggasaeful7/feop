export type BillKind = "monthly" | "one_time";
export type BillStatus = "unpaid" | "pending_verification" | "paid" | "rejected" | "void";

export type ResidentBillQueryParams = {
  status?: string;
  kind?: string;
  unit_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
};

export type ResidentBill = {
  id: string;
  workspace_id: string;
  unit_id?: string;
  person_id?: string;
  kind: BillKind;
  title: string;
  period_start?: string;
  period_end?: string;
  base_amount: number;
  platform_fee: number;
  total_amount: number;
  status: BillStatus;
  due_at?: string;
  paid_at?: string;
  has_proof: boolean;
  proof_file_name?: string;
  proof_mime_type?: string;
  proof_size?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ResidentBillCreatePayload = {
  unit_id?: string;
  person_id?: string;
  kind: BillKind;
  title: string;
  period_start?: string;
  period_end?: string;
  base_amount: number;
  due_at?: string;
  notes?: string;
};

export type PaymentQuote = {
  base_amount: number;
  platform_fee: number;
  total_amount: number;
};

export type ProofURL = {
  url: string;
  expires_at: string;
  file_name: string;
};
