import type { BillPayer } from "./master-data";

export type BillKind = "monthly" | "specific";
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
  bill_payer?: BillPayer | null;
  bill_payer_name?: string | null;
  month?: number;
  year?: number;
  created_by?: string;
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

export type ResidentBillByUnitQueryParams = {
  year?: number;
  status?: string;
  kind?: string;
  search?: string;
  page?: number;
  per_page?: number;
  unit_id?: string;
  unit?: string;
  name?: string;
  is_late?: boolean | string;
  rt?: string;
  sort?: string;
};

export type ResidentBillByUnitItem = {
  unit_id: string;
  unit_code: string;
  unit_block?: string;
  owner_name?: string;
  resident_name?: string;
  bills: ResidentBill[];
  bills_debt?: ResidentBill[];
};

export type ResidentBillSummary = {
  total_bills: number;
  paid_bills: number;
  unpaid_bills: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
};


