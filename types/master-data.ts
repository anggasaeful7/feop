export type UnitType = {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  area_sqm: number;
  unit_count: number;
  monthly_tariff: number;
  effective_from: string;
  created_at: string;
  updated_at: string;
};

export type BillComponent = {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  amount?: number | null;
  is_variable: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type UnitTypePayload = {
  code: string;
  name: string;
  area_sqm: number;
  unit_count: number;
  monthly_tariff: number;
  effective_from: string;
};

export type BillComponentPayload = {
  name: string;
  description?: string | null;
  amount?: number | null;
  is_variable: boolean;
  is_active: boolean;
  sort_order: number;
};

export type UnitRef = { id: string; code: string };

export type Person = {
  id: string;
  workspace_id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  id_card_no?: string | null;
  notes?: string | null;
  owned_units: UnitRef[];
  resided_in_units: UnitRef[];
  is_owner: boolean;
  is_resident: boolean;
  created_at: string;
  updated_at: string;
};

export type PersonPayload = {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  id_card_no?: string | null;
  notes?: string | null;
};

export type UnitStatus = "occupied" | "vacant" | "maintenance";
export type BillPayer = "owner" | "resident";

export type Unit = {
  id: string;
  workspace_id: string;
  unit_type_id: string;
  unit_type_code: string;
  unit_type_name: string;
  code: string;
  block?: string | null;
  floor?: number | null;
  status: UnitStatus;
  bill_payer: BillPayer;
  owner_id?: string | null;
  owner_name?: string | null;
  resident_id?: string | null;
  resident_name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type UnitPayload = {
  unit_type_id: string;
  code: string;
  block?: string | null;
  floor?: number | null;
  status?: UnitStatus;
  bill_payer: BillPayer;
  owner_id?: string | null;
  resident_id?: string | null;
  notes?: string | null;
};

export type UnitQueryParams = {
  search?: string;
  unit_type_id?: string;
  status?: UnitStatus;
  page?: number;
  per_page?: number;
};
