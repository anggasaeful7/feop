export type Punishment = {
  id: string;
  workspace_id: string;
  duration_months: number;
  created_at: string;
  updated_at: string;
};

export type PunishmentPayload = {
  duration_months: number;
};
