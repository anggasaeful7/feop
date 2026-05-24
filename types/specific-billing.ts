export type SpecificBilling = {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type SpecificBillingPayload = {
  title: string;
  description: string;
  amount: number;
  is_active: boolean;
};

export type IssueSpecificBillingPayload = {
  month: number;
  year: number;
  unit_ids: string[];
};

export type SpecificBillingQueryParams = {
  search?: string;
  page?: number;
  per_page?: number;
};
