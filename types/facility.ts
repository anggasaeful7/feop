export type PricingMode = "per_session" | "monthly";

export type Facility = {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string | null;
  pricing_mode: PricingMode;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bookings_mtd: number;
  revenue_mtd: number;
  pending_count: number;
};

export type FacilityPayload = {
  code: string;
  name: string;
  description: string | null;
  pricing_mode: PricingMode;
  price: number;
  is_active: boolean;
};

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  workspace_id: string;
  facility_id: string;
  facility_code: string;
  facility_name: string;
  unit_id: string | null;
  unit_code: string | null;
  requester_name: string;
  starts_at: string;
  ends_at: string;
  purpose: string | null;
  price: number;
  status: BookingStatus;
  proof_url: string | null;
  decision_by_user_id: string | null;
  decision_at: string | null;
  decision_note: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingPayload = {
  facility_id: string;
  unit_id: string | null;
  requester_name: string;
  starts_at: string;
  ends_at: string;
  purpose: string | null;
  price: number | null;
  proof_url: string | null;
};

