export type GeneralFacility = {
  id: string;
  workspace_id: string;
  name: string;
  is_active: boolean;
  is_auto_suspend: boolean;
  created_at: string;
  updated_at: string;
};

export type GeneralFacilityPayload = {
  name: string;
  is_active: boolean;
  is_auto_suspend: boolean;
};

export type AssignGeneralFacilityPayload = {
  general_facility_ids: string[];
  unit_ids: string[];
};

export type GeneralFacilityAssignedItem = {
  id: string;
  workspace_id: string;
  name: string;
  is_active: boolean;
  assigned_at: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
};

export type UnitWithGeneralFacilities = {
  unit_id: string;
  unit_code: string;
  unit_block: string;
  owner_name: string;
  resident_name: string;
  bill_payer: string;
  general_facilities: GeneralFacilityAssignedItem[];
};
