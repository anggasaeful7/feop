export type ReportKind = "monthly" | "yearly";
export type ReportStatus = "draft" | "published";

export type FinancialReport = {
  id: string;
  workspace_id: string;
  period_year: number;
  period_month?: number | null;
  kind: ReportKind;
  status: ReportStatus;
  title?: string | null;
  notes?: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  notify_residents: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
};

export type UpdateFinancialReportPayload = {
  period_year: number;
  period_month?: number | null;
  kind: ReportKind;
  title?: string | null;
  notes?: string | null;
  publish: boolean;
  notify_residents: boolean;
};
