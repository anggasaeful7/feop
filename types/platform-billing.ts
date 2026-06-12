export type PlatformBillingSettings = {
  default_platform_fee: number;
  min_platform_fee: number;
  updated_at: string;
  updated_by?: string;
};

export type WorkspaceFee = {
  workspace_id: string;
  effective_platform_fee: number;
  override_platform_fee?: number;
  default_platform_fee: number;
  min_platform_fee: number;
  updated_at?: string;
};

export type WorkspaceFeePayload = {
  // null/omitted clears the override and falls back to platform default.
  platform_fee: number | null;
};

export type PlatformPaymentQuote = {
  base_amount: number;
  platform_fee: number;
  total_amount: number;
};
