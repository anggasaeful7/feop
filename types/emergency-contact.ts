export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  hours: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  is_active: boolean;
  is_emergency: boolean;
  sort_order: number;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContactPayload {
  name: string;
  role: string;
  hours: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  is_emergency: boolean;
  sort_order: number;
}

export interface EmergencyContactQueryParams {
  only_active?: boolean;
}
