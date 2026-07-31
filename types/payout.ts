export type ProtobufTimestamp = {
  seconds: number;
  nanos: number;
};

export type PayoutLog = {
  id: string;
  workspace_id: string;
  trigger_source: string;
  triggered_by_email: string;
  amount: string;
  status: string;
  reason: string;
  error_message?: string;
  created_at: ProtobufTimestamp;
  updated_at: ProtobufTimestamp;
  workspace_name: string;
  bank_account_name: string;
  bank_account_number: string;
  sub_account_number: string;
  balance_before_payout: string;
  payout_balance: string;
};

export type PayoutLogQueryParams = {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
};

export const PAYOUT_LOG_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
] as const;

export function payoutStatusVariant(status: string) {
  switch (status) {
    case "completed":
    case "success":
      return "success" as const;
    case "processing":
      return "info" as const;
    case "pending":
      return "warning" as const;
    case "failed":
      return "danger" as const;
    default:
      return "default" as const;
  }
}
