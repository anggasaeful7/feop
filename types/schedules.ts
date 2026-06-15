export type BaseSchedule = {
  id: string;
  workspace_id: string;
  activity: string;
  shift_id: string;
  officer_ids?: string[]; // Make it optional since detail API might omit it
  scheduled_date: string;
  category: "daily" | "weekly" | "once";
  days_off?: string[];
  holiday_dates?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Populated fields from detail API
  shift_name?: string;
  time_start?: string;
  time_end?: string;
  worker_name?: string;
  officers?: {
    id: string;
    name: string;
    division: string;
    contact?: string;
  }[];
};

export type CleaningSchedule = BaseSchedule;
export type SecuritySchedule = BaseSchedule;

export type BaseSchedulePayload = {
  activity: string;
  shift_id: string;
  officer_ids: string[];
  scheduled_date: string;
  category: "daily" | "weekly" | "once";
  days_off?: string[];
  holiday_dates?: string[];
  notes?: string;
};

export type CleaningSchedulePayload = BaseSchedulePayload;
export type SecuritySchedulePayload = BaseSchedulePayload;

export type BulkCleaningSchedulePayload = {
  items: CleaningSchedulePayload[];
};

export type BulkSecuritySchedulePayload = {
  items: SecuritySchedulePayload[];
};
