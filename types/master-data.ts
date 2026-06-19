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

export type UnitTypeQueryParams = {
  search?: string;
  page?: number;
  per_page?: number;
};

export type BillComponentPayload = {
  name: string;
  description?: string | null;
  amount?: number | null;
  is_variable: boolean;
  is_active: boolean;
  sort_order: number;
};

export type AssignBillComponentPayload = {
  component_ids: string[];
};

export type BillComponentMatrixItem = {
  id: string;
  name: string;
  amount: number;
  assigned: boolean;
};

export type UnitBillComponentsMatrixResponse = {
  unit_id: string;
  components: BillComponentMatrixItem[];
};

export type UnitRef = { id: string; code: string };

export type FamilyMember = {
  id: string;
  workspace_id: string;
  person_id: string;
  name: string;
  nik_no_kk: string;
  relationship: string;
  contact: string;
  gender: string;
  has_picture: boolean;
  picture_file_name?: string | null;
  created_at: string;
  updated_at: string;
};

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
  family_members?: FamilyMember[];
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
  bill_payer: BillPayer | null;
  owner_id?: string | null;
  owner_name?: string | null;
  resident_id?: string | null;
  resident_name?: string | null;
  rt?: string | null;
  rw?: string | null;
  occupancy_month?: string | null;
  occupancy_year?: string | null;
  notes?: string | null;
  active_components?: {
    id: string;
    name: string;
    amount: number;
  }[];
  created_at: string;
  updated_at: string;
};

export type UnitPayload = {
  unit_type_id: string;
  code: string;
  block?: string | null;
  floor?: number | null;
  status?: UnitStatus;
  bill_payer: BillPayer | null;
  owner_id?: string | null;
  resident_id?: string | null;
  rt?: string | null;
  rw?: string | null;
  occupancy_month?: string | null;
  occupancy_year?: string | null;
  notes?: string | null;
};

export type UnitQueryParams = {
  search?: string;
  unit_type_id?: string;
  status?: UnitStatus;
  rt?: string;
  rw?: string;
  page?: number;
  per_page?: number;
  exclude_vacant?: boolean;
};

export type PersonQueryParams = {
  search?: string;
  role?: string;
  page?: number;
  per_page?: number;
};

export type OfficerDivision = "cleaning" | "security";

export type Officer = {
  id: string;
  workspace_id: string;
  name: string;
  division: OfficerDivision;
  contact: string;
  email: string;
  is_active: boolean;
  account_type?: string;
  login_username?: string;
  created_at: string;
  updated_at: string;
};

export type OfficerPayload = {
  name: string;
  division: OfficerDivision;
  contact: string;
  email: string;
  is_active: boolean;
};

export type OfficerQueryParams = {
  search?: string;
  division?: OfficerDivision;
  page?: number;
  per_page?: number;
};

export type Shift = {
  id: string;
  workspace_id: string;
  name: string;
  division: OfficerDivision;
  time_start: string;
  time_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ShiftPayload = {
  name: string;
  division: OfficerDivision;
  time_start: string;
  time_end: string;
  is_active: boolean;
};

export type ShiftQueryParams = {
  search?: string;
  division?: OfficerDivision;
  page?: number;
  per_page?: number;
};

export type RW = {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RWPayload = {
  code: string;
  name: string;
  is_active: boolean;
};

export type RWBulkPayload = {
  items: RWPayload[];
};

export type RWQueryParams = {
  search?: string;
  page?: number;
  per_page?: number;
};

export type RT = {
  id: string;
  workspace_id: string;
  rw_id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RTPayload = {
  rw_id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type RTBulkPayload = {
  items: RTPayload[];
};

export type RTQueryParams = {
  search?: string;
  rw_id?: string;
  page?: number;
  per_page?: number;
};
