export type DashboardBillingSummary = {
  total_bills: number;
  paid_bills: number;
  unpaid_bills: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
};

export type DashboardUnitSummary = {
  total_units: number;
  active_units: number;
};

export type DashboardPaymentStatus = {
  belum_bayar: number;
  sudah_bayar: number;
  total: number;
};

export type DashboardBillingTrend = {
  year: number;
  month: number;
  label: string;
  total_bills: number;
  paid_bills: number;
  unpaid_bills: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
};

export type DashboardRecentActivity = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  created_at: string;
};

export type DashboardData = {
  billing_summary: DashboardBillingSummary;
  unit_summary: DashboardUnitSummary;
  payment_status: DashboardPaymentStatus;
  billing_trend: DashboardBillingTrend[];
  recent_activity: DashboardRecentActivity[];
};

export type GetDashboardParams = {
  month?: number | string;
  bulan?: number | string;
  year?: number | string;
  tahun?: number | string;
  rt?: string;
  rw?: string;
  rt_id?: string;
  rw_id?: string;
  overdue_months?: number | string;
};
